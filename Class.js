/**
 * current alias name : Class<br>
 * Class("com.Test", {});
 */
+(function(g, alias) {

	alias = alias || "Class"; // alias name default:Class
	var config = {
		// class name must equal file name.
		strict : true,
		// debug:ajax load class, not debug:compress js load.
		debug : false,
		// in debug mode, paths mapping for class of roots.
		mapping : {},
		// timeout for load script.
		timeout : 30000
	};
	var loading = {}, classes = {}, ready;
	var NONE = undefined, LOADING = 1, SUCCESS = 2, FAIL = 3;
	var regClassName = /^[_a-zA-Z]\w*(\.[_a-zA-Z]\w*)+$/;
	// var regImport = /Class\((["'"])([_a-zA-Z]\w*(\.[_a-zA-Z]\w*)+)\1,/;
	var regImport = new RegExp(alias + "\\(([\"'\"])([_a-zA-Z]\\w*(\\.[_a-zA-Z]\\w*)+)\\1,");
	var keyField = [ "_class", "_className", "_superClass", "parent", "callParent" ];

	// main method.
	function Class(className, parentName, cfg) {
		var args = arguments, len = args.length;
		if (len == 2) {
			cfg = args[1];
			parentName = null;
		}
		valid(isString(className) && regClassName.test(className), "Define class name error.");
		valid(isNone(parentName) || (isString(parentName) && regClassName.test(parentName)), "Define class parentName error.");
		valid(isObject(cfg), "Define class config error.");

		valid(!isDefined(className), "Class is defined:" + className);
		valid(isNone(cfg.imports) || isArray(cfg.imports), "")

		build(className, parentName, cfg, function(clazz) {
			if (isFunction(clazz.initialize)) {
				clazz.initialize();
			}
		});
	}

	function OnceDeferred() {
		var clazz = Function(), fns = [];
		copy(clazz, {
			isTriggered : false,
			trigger : function() {
				var me = this;
				me.isTriggered = true;
				for (var i = 0; i < fns.length; i++) {
					fns[i](me);
				}
				fns = [];
			},
			add : function(fn) {
				var me = this;
				fns.push(fn);
				me.isTriggered && me.trigger();
			}
		});
		return clazz;
	}
	function loadScript(url, fn, sync) {
		if (isLocal()) {
			return localLoadScript(url, fn, sync);
		}
		var xhr = null;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		valid(xhr, "Error:create XMLHttpRequest.");

		xhr.onreadystatechange = function(resp) {
			if (xhr.readyState == 4) {
				fn(xhr.status == 200, xhr.responseText, xhr.status);
			}
		};
		if (!sync) {
			xhr.timeout = config.timeout;
		}
		xhr.open("GET", url, !sync);
		try {
			xhr.send();
		} catch (e) {
			console.warn(e);
			fn(false, "", xhr.status);
		}
	}
	function localLoadScript(url, fn, sync) {
		var script = document.createElement("script");
		script.src = url;
		script.async = !sync;
		script.onload = function() {
			fn(true);
			document.head.removeChild(script);
		}
		script.onerror = function() {
			fn(false);
			document.head.removeChild(script);
		}
		document.head.appendChild(script);
	}
	function valid(exp, msg) {
		if (!exp) {
			throw msg || "Error";
		}
	}
	function defaults(v, df) {
		return isNone(v) ? df : v;
	}
	function isType(o, type) {
		return Object.prototype.toString.call(o) === "[object " + type + "]";
	}
	function isString(o) {
		return ("string" === typeof (o)) || isType(o, "String");
	}
	function isFunction(o) {
		return "function" === typeof (o);
	}
	function isNone(o) {
		return undefined === o || null === o;
	}
	function isObject(o) {
		return isType(o, "Object");
	}
	function isArray(o) {
		return isType(o, "Array");
	}
	function isArrayType(o, type) {
		var len = o.length;
		for (var i = 0; i < len; i++) {
			if (!isType(o[i], type)) {
				return false;
			}
		}
		return true;
	}
	function isCopyable(scope, k) {
		if (!scope.hasOwnProperty(k)) {
			return false;
		} else if (inArray(k, keyField)) {
			return false;
		}
		return true;
	}
	function isLocal() {
		return location.href.indexOf("file://") != -1
	}
	function isDefined(className) {
		return null != getClass(className);
	}
	function inArray(o, arr) {
		return -1 != arr.indexOf(o);
	}
	function getClassInfo(className) {
		var info = classes[className];
		if (isNone(info)) {
			info = (classes[className] = {
				state : NONE,
				start : new Date().getTime(),
				notify : OnceDeferred()
			});
			loading[className] = LOADING;
			ready.isTriggered = false;
			setTimeout(function() {
				if (SUCCESS != info.state && FAIL != info.state) {
					info.state = FAIL;
					console.warn("Load script timeout:" + className);
				}
			}, config.timeout);
		}
		return info;
	}
	function getClass(className) {
		var info = getClassInfo(className);
		return SUCCESS == info.state ? info._class : null;
	}
	function add(className, fn) {
		getClassInfo(className).notify.add(fn);
	}
	function checkReady(className) {
		if (className) {
			delete loading[className];
		}
		var count = 0;
		for ( var k in loading) {
			if (loading.hasOwnProperty(k)) {
				count++;
			}
		}
		if (count === 0) {
			ready.trigger();
		}
	}
	function copy(o1, o2) {
		if (o1 && o2) {
			for ( var k in o2) {
				if (isCopyable(o2, k)) {
					o1[k] = o2[k];
				}
			}
		}
	}
	function importClass(className, fn, needValid) {
		if (needValid) {
			valid(isString(className) && regClassName.test(className), "Preload class name error:" + className);
		}

		if (isDefined(className)) {
			fn();
		} else {
			var info = getClassInfo(className), state = info.state;
			info.notify.add(fn);
			if (LOADING != state) {
				valid(FAIL != state, "Last load class fail:" + className);
				if (config.debug) {
					var arr = className.split("."), root = arr[0], prefix = config.mapping[root];
					valid(prefix, "Not found “" + root + "” mapping.");

					arr[0] = prefix;
					var url = arr.join("/") + ".js";
					loadScript(url, function(success, text, status) {
						if (success) {
							if (isLocal()) {
								return console.warn("Local script load, not confirm result:" + url);
							}
							var time = new Date().getTime() - info.start;
							if (time < config.timeout) {
								var temp = regImport.exec(text), target = (temp || [])[2];
								valid(target, "Load script '" + url + "' error.");
								if (config.strict) {
									valid(target == className, "Import class:" + className + ", but really import:" + target);
								}
								eval(text);
							}
						} else {
							info.state = FAIL;
							console.error("Load script error:" + className);
						}
					});
				}
			}
		}
	}
	function importClasses(imports, fn) {
		var len = imports.length;
		+function(i) {
			var current = arguments;
			if (i < len) {
				importClass(imports[i], function() {
					current.callee(i + 1);
				}, true);
			} else {
				fn();
			}
		}(0);
	}

	function build(className, parentName, cfg) {
		var info = getClassInfo(className), clazz = function() {
			var me = this;
			me.parent && me.callParent(arguments);
			me._class.constructor.apply(me, arguments);
		};
		clazz.constructor = cfg.constructor || Function();
		clazz.prototype._class = clazz;
		clazz.prototype._className = (clazz._className = className);

		// state change.
		info.state = LOADING;

		var deferContent = OnceDeferred();
		deferContent.add(function() {
			copy(clazz, cfg.statics);
			delete cfg.statics;

			copy(clazz.prototype, cfg);

			var deferInit = OnceDeferred();
			deferInit.add(function() {
				if (isFunction(clazz.initialize)) {
					clazz.initialize();
				}
				info._class = clazz;
				info.state = SUCCESS;
				info.notify.trigger();

				checkReady(className);
			});

			var imports = cfg.imports;
			if (isArray(imports)) {
				valid(isArrayType(imports, "String"), "config imports type must be String.");
				importClasses(imports, function() {
					deferInit.trigger();
				});
			} else {
				deferInit.trigger();
			}
		});

		if (parentName) {
			var deferParent = OnceDeferred();
			deferParent.add(function() {
				var parent = getClass(parentName);
				copy(clazz.prototype, parent.prototype);

				clazz._superClass = parent;
				clazz.prototype.parent = parent.prototype;

				clazz.prototype.callParent = function(args, _class) {
					_class = _class || this._class;
					var parentClass = _class._superClass;
					if (parentClass) {
						if (parentClass._superClass) {
							arguments.callee.apply(this, [ args, parentClass ]);
						}
						parentClass.constructor.apply(this, args);
					}
				};
				deferContent.trigger();
			});
			if (isDefined(parentName)) {
				deferParent.trigger();
			} else {
				importClass(parentName, function() {
					deferParent.trigger();
				});
			}
		} else {
			deferContent.trigger();
		}
	}

	// instance more
	ready = OnceDeferred();
	ready.isTriggered = true;

	copy(Class, {
		ready : function(imports, fn) {
			if (isFunction(imports)) {
				ready.add(imports);
			} else {
				importClasses(isArray(imports) ? imports : [ imports ], function() {
					isFunction(fn) && ready.add(fn);
				});
			}
		},
		config : function(cfg) {
			if (isObject(cfg)) {
				for ( var k in config) {
					if ("mapping" != k) {
						config[k] = defaults(cfg[k], config[k]);
						delete cfg[k];
					}
				}

				for ( var k in cfg) {
					var v = cfg[k];
					if (cfg.hasOwnProperty(k) && isString(v)) {
						config.mapping[k] = v;
					}
				}
			}
		},
		create : function(className) {
			var clazz = getClass(className), args = [];
			valid(clazz, "The class is undefined:" + className);
			Array.prototype.push.apply(args, arguments);
			args.splice(0, 1, clazz);

			var allArgs = [ "a" ], strArgs = [], seed = 97, len = args.length;
			for (var i = 1; i < len; i++) {
				strArgs.push(String.fromCharCode(seed + i));
			}
			Array.prototype.push.apply(allArgs, strArgs);
			var fn = Function(allArgs.join(","), "return new a(" + strArgs.join(",") + ");");
			return fn.apply(null, args);
		},
		isDefined : isDefined,
		getClass : getClass
	});

	g[alias] = Class;
})(this);
