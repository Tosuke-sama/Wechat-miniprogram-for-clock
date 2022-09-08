// pages/clock.js
let qqMapSdk= require("../../qqmap-wx-jssdk1.2/qqmap-wx-jssdk.js");
let util = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    signType:0,//0上班打卡 1下班打卡
    is_out:1,//1办公地点打卡 0外勤打卡
    is_meal:1,//1未定餐 2已订餐
    now_time: '',//当前时间
    nowDate:'',//当前年月日
    nowDay:'',//星期几
    tip:'',//提示 上午好、下午好
    current_address: '',//当前定位地址
    status: 0, //0未打卡 1已打卡
    latlng:[],//经纬度
    now_time_stop: '', //已打卡时间
    area:{},//考勤点多个
    record:[],//打卡记录
    dialogVisible:false,
    Distance:10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCurrentTime();
    this.setData({
      now_time: this.getTime(),
      nowDate: util.formatTime(new Date()),
      nowDay: util.formatDay(new Date()),
      tip: util.formatSole(),
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLocation();
    this.setData({
      status:0,
      current_address:'',
    })
    // while(typeof(this.Distance)!=Number){
    //   this.getSignRecord()
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getSignRecord()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  signTap() {
    var that = this;
    if (!that.data.current_address) {
      return wx.showToast({
        title: '未获取当前定位',
        icon: 'error'
      })
    }
    if(that.data.is_out==0){
      console.log(that.data.Distance);
      return wx.showToast({
        title: '打卡失败！欸~真的在协会嘛？',
        icon: 'none'
      })
    }
    var list =  that.data.record.concat({'times':that.data.now_time,'address':that.data.current_address});
    wx.vibrateLong();//手机震动提示
    that.getSignRecord();
    that.setData({
      status: 1, //已打卡
      record:list,
      now_time_stop: that.data.now_time,
      signType:that.signType==1?0:1,
    })
    console.log(list);
    console.log(that.data.record);
    wx.showToast({
      title: '打卡成功',
      icon: 'none'
    })
  },
 
  getCurrentTime: function () {
    var time = setInterval(() => {
      this.setData({
        now_time: this.getTime()
      })
    }, 1000)
  },
  getTime() {
    let dateTime = '';
    let hh = new Date().getHours()
    let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() :
      new Date().getMinutes()
    let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() :
      new Date().getSeconds()
    dateTime = hh + ':' + mf + ':' + ss;
    return dateTime;
  },
 
  // 请求获取定位授权
  getUserAuth: function () {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.userLocation'
      }).then(() => {
        resolve()
      }).catch(() => {
        let that = this;
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
              wx.showModal({
                title: '请求授权当前位置',
                content: '需要获取您的地理位置，请确认授权',
                success: function (res) {
                  if (res.cancel) {
                    wx.showToast({
                      title: '拒绝授权',
                      icon: 'none',
                      duration: 1000
                    })
                  } else if (res.confirm) {
                    wx.openSetting({
                      success: function (dataAu) {
                        if (dataAu.authSetting["scope.userLocation"] == true) {
                          //再次授权，调用wx.getLocation的API
                          that.getLocation();
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'none',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            } else if (res.authSetting['scope.userLocation'] == undefined) {
              that.getLocation();
            } else {
              that.getLocation();
            }
          }
        })
      })
    })
  },
 
  getLocation: function () {
    const that = this
		// 实例化腾讯地图API核心类
    const QQMapWX = new qqMapSdk({
      key: 'AI4BZ-M3PC5-EH6IZ-Q7DJX-YXTV2-Y2FNX'// KEY必填
    });
    //获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.latitude = res.latitude
        that.longitude = res.longitude
        QQMapWX.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            let address = res.result.address + res.result.formatted_addresses.recommend;
            that.getSignRecord();
            that.setData({
              current_address:address,
              latlng:[res.result.location.lat,res.result.location.lng]
            })
          },
          fail: function(res) {
            this.getUserAuth()
            wx.showToast({
              title: '获取定位失败，请打开手机定位，重新进入！',
              icon: 'none'
            });
          }
        })
      },
    })
  },
  // 刷新定位
  refreshAdd() {
    this.getLocation(),
    this.getSignRecord()
  },
 
  //处理打卡记录及判断打卡位置是否办公地点打卡
  getSignRecord: function () {
    var that = this;
    console.log(that.data.latlng);
    var distance = that.getDistance(that.data.latlng[0],that.data.latlng[1],30.00712,104.158177);
    that.data.Distance=distance;
    console.log(distance);
    if(distance < 3000){
      that.setData({
        is_out:1,
      }); 
    }
    else{
      that.setData({
        is_out:0,
      }); 
    }
  },
 
 
//经纬度距离计算
getDistance:function (lat1, lng1, lat2, lng2, unit = false) {
    var radLat1 = lat1 * Math.PI / 180.0
    var radLat2 = lat2 * Math.PI / 180.0
    var a = radLat1 - radLat2
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
    s = s * 6378.137 // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000 //输出为公里
    if (0) { //是否返回带单位
      if (s < 1) { //如果距离小于1km返回m
        s = s.toFixed(3)
        s = s * 1000 + "m"
      } else {
        s = s.toFixed(2)
        s = s + "km"
      }
    } else {
      s = s.toFixed(3)
      s = s * 1000
    }
	return s
},
 
//订餐操作
ToMealTap:function (e) {
  wx.showToast({
    title: '订餐成功',
    icon: 'none'
  })
  this.setData({
    is_meal: 2,
  })
}

})


