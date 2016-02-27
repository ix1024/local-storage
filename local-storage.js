/*
	Name:   本地存储兼容解决方案;
	Author: Kingwell Leng;
	Date:   2015-03-25;
*/
(function(window, undefined) {
	'use strict';
	var dc = document,
		de = dc.documentElement,
		isSupportLocalStorage = window.localStorage && window.localStorage.setItem ? true : false; //是否支持Local Storage

	function LocalStorage() {}
	LocalStorage.prototype = {
		log: function() {
			try {
				console.log.apply(console, arguments);
			} catch (e) {}
		},
		set: function(sName, sValue, oExpires, sPath, sDomain, bSecure) {
			var cookies, name, value, expires, path, domain, secure;
			if (arguments.length < 2) {
				return false;
			}
			if (typeof arguments[0] === 'object') {
				name = arguments[0]['name'];
				value = arguments[0]['value'];
				expires = arguments[0]['expires'];
				path = arguments[0]['path'];
				domain = arguments[0]['domain'];
				secure = arguments[0]['secure'];
			} else {
				name = sName;
				value = sValue;
				expires = oExpires;
				path = sPath;
				domain = sDomain;
				secure = bSecure;
			}
			if (isSupportLocalStorage) {
				localStorage.setItem(name, value);
			} else {
				try {
					this.userDataStroage.setItem(name, value);
				} catch (e) {
					this.setCookie(name, value, expires, path, domain, secure);
				}
			}
			return sValue;
		},
		get: function(sName) {
			var result = null;
			if (!arguments.length) {
				return result;
			}
			if (isSupportLocalStorage) {
				result = localStorage.getItem(sName);
			} else {
				try {
					this.userDataStroage.getItem(sName)
				} catch (e) {
					this.getCookie(sName);
				}
			}
			return result;
		},
		remove: function(sName, sPath, sDomain) {
			var name, path, domain;
			if (typeof arguments[0] === 'object') {
				name = arguments[0]['name'];
				path = arguments[0]['path'];
				domain = arguments[0]['domain'];
			} else {
				name = sName;
				path = sPath;
				domain = sDomain;
			}
			if (!arguments.length) {
				return null;
			}
			if (isSupportLocalStorage) {
				localStorage.removeItem(name);
			} else {
				try {
					this.userDataStroage.removeItem(name)
				} catch (e) {
					this.removeCookie(name, path, domain);
				}
			}
			return sName;
		},
		clear: function() {
			if (confirm('确定要清除所有数据吗？')) {
				if (isSupportLocalStorage) {
					localStorage.clear();
				} else {
					try {
						this.userDataStroage.clear()
					} catch (e) {
						this.clearAllCookie();
					}
				}
			}
		},
		/*
			User Data 
		*/
		userDataStroage: {
			init: function() {
				var memory = dc.createElement('div');
				memory.id = "_memory";
				memory.style.display = 'none';
				memory.style.behavior = 'url(#default#userData)';
				dc.body.appendChild(memory);
				return memory;
			},
			setItem: function(key, value) {
				var memory = this.init();
				memory.setAttribute(key, value);
				memory.save('UserDataStorage');
			},
			getItem: function(key) {
				var memory = this.init();
				memory.load('UserDataStorage');
				return memory.getAttribute(key) || null;
			},
			removeItem: function(key) {
				var memory = this.init();
				memory.removeAttribute(key);
				memory.save('UserDataStorage');
			},
			clear: function() {}
		},
		/*
			Cookie
		*/
		setCookie: function(sName, sValue, oExpires, sPath, sDomain, bSecure) { //设置Cookie
			var cookies, name, value, expires, path, domain, secure;
			if (typeof arguments[0] === 'object') {
				name = arguments[0]['name'];
				value = arguments[0]['value'];
				expires = arguments[0]['expires'];
				path = arguments[0]['path'];
				domain = arguments[0]['domain'];
				secure = arguments[0]['secure'];
			} else {
				name = sName;
				value = sValue;
				expires = oExpires;
				path = sPath;
				domain = sDomain;
				secure = bSecure;
			}
			cookies = name + '=' + encodeURIComponent(value);
			if (expires) {
				var date = new Date();
				date.setTime(date.getTime() + oExpires * 60 * 60 * 1000);
				cookies += '; expires=' + date.toUTCString();
			}
			if (path) {
				cookies += '; path=' + path;
			}
			if (domain) {
				cookies += '; domain=' + domain;
			}
			if (secure) {
				cookies += '; secure' + secure;
			}
			dc.cookie = cookies;
			return value;
		},
		getCookie: function(sName) { //获取Cookie
			var sRE = '(?:; )?' + sName + '=([^;]*)',
				oRE = new RegExp(sRE),
				result = null;
			if (oRE.test(dc.cookie)) {
				result = decodeURIComponent(RegExp.$1);
			}
			return result;
		},
		removeCookie: function(sName, sPath, sDomain) { //删除Cookie
			var name, path, domain;
			if (typeof arguments[0] === 'object') {
				name = arguments[0]['name'];
				path = arguments[0]['path'];
				domain = arguments[0]['domain'];
			} else {
				name = sName;
				path = sPath;
				domain = sDomain;
			}
			this.setCookie(name, '', new Date(0), path, domain);
			return name;
		},
		clearAllCookie: function() { //清除所有Cookie
			var cookies = dc.cookie.split(";"),
				len = cookies.length;
			for (var i = 0; i < len; i++) {
				var cookie = cookies[i],
					eqPos = cookie.indexOf("="),
					name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
				name = name.replace(/^\s*|\s*$/, "");
				dc.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
			}
		}
	};
	window.storage = new LocalStorage();

})(this);

//支持AMD规范
if (typeof define === "function" && define.amd && define.amd.storage) {
	define("storage", [], function() {
		return storage;
	});
}