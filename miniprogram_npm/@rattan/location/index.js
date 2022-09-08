module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1662601821961, function(require, module, exports) {
// 定位类型：国测局
const kLocationType = "gcj02"

// =====================================
// ============== 定位监控 ==============

/// 结束定位监控
function zmEndMonitor() {
	// #ifdef MP-WEIXIN
	console.log("========zmEnd")
	wx.offLocationChange(function(res) {
		zmLocationSuc(res)
	});
	wx.offLocationChangeError(function(err) {
		zmLocationErr(err)
	});
	// #endif
}

// 判断是否获得了用户地理位置授权
function zmStartMonitor() {
	// #ifdef MP-WEIXIN
	return new Promise((resolve, reject) => {
		wx.getSetting({
			success: (res) => {
				// 查看位置权限的状态 如果是首次授权(undefined)或者之前拒绝授权(false)            
				//!res.authSetting['scope.userLocation']
				if (res.authSetting['scope.userLocation'] == false) {
					//之前拒绝授权(false)
					zmAuthorityOpen(false)
					zmOpenConfirm()
				} else {
					//如果是首次授权则弹出授权窗口进行授权，如果之前进行了授权，则获取地理位置信息
					zmBeginLocation()
				}
				resolve(res)
			},
			fail: (err) => {
				console.log("getSetting_err:", JSON.stringify(err))
				zmAuthorityOpen(false)
				reject(err)
			}
		})
	})
	// #endif
}

// 授权弹窗
function zmOpenConfirm() {
	// #ifdef MP-WEIXIN
	wx.showModal({
		content: '检测到您没打开定位权限，是否去设置打开？',
		confirmText: "确认",
		cancelText: "取消",
		success: function(res) {
			console.log(res);
			//点击“确认”时打开设置页面
			if (res.confirm) {
				console.log('用户点击确认')
				wx.openSetting({
					success: (res) => {
						zmBeginLocation()
					}
				})
			} else {
				console.log('用户点击取消')
				zmAuthorityOpen(false)
			}
		}
	});
	// #endif
}

// 开启定位监听
function zmBeginLocation() {
	// #ifdef MP-WEIXIN
	wx.startLocationUpdate({
		type: kLocationType,
		success(res) {
			zmAuthorityOpen(true)
			console.log("startLocation_suc: " + JSON.stringify(res));
		},
		fail(err) {
			zmAuthorityOpen(false)
			console.error("startLocation_err: " + JSON.stringify(err));
		},
	})
	wx.onLocationChange(function(res) {
		zmLocationSuc(res)
	});
	wx.onLocationChangeError(function(res) {
		zmLocationErr(res)
	});
	// #endif
}

/// 监控定位信息成功
function zmLocationSuc(res) {
	/* {
	"latitude":24.44579,
	"longitude":118.08243,
	"speed":-1,
	"accuracy":65,
	"verticalAccuracy":65,
	"horizontalAccuracy":65,
	"errMsg":"getLocation:ok"
	} */
	uni.$emit("iLocationSuc", res)
}

/// 监控定位信息失败
function zmLocationErr(err) {
	uni.$emit("iLocationErr", err)
}

/// 监控定位权限开关
function zmAuthorityOpen(e) {
	uni.$emit("iAuthorityOpen", e)
}

// ==========================
// ==========================

/**
 * 获取本地经纬度
 */
function zmLocation() {
	return new Promise((resolve, reject) => {
		uni.getSetting({
			success: (res) => {
				// 查看位置权限的状态 如果是首次授权(undefined)或者之前拒绝授权(false)            
				//!res.authSetting['scope.userLocation']
				if (res.authSetting['scope.userLocation'] == false) {
					uni.authorize({
						success(res) {
							/// 获取当前的地理位置、速度。
							uni.getLocation({
								type: 'gcj02',
								success: function(res) {
									resolve(res)
								},
								fail: function(err) {
									reject(err);
								}
							});
						},
						fail(err) {
							reject(err);
						}
					})
				} else {
					//如果是首次授权则弹出授权窗口进行授权，如果之前进行了授权，则获取地理位置信息
					/// 获取当前的地理位置、速度。
					uni.getLocation({
						type: 'gcj02',
						success: function(res) {
							resolve(res)
						},
						fail: function(err) {
							reject(err);
						}
					});
				}
			}
		})
	})
}

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
	zmStartMonitor,
	zmEndMonitor,
	zmLocation,
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1662601821961);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map