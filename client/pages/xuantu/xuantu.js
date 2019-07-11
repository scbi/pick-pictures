// client/pages/xuantu/xuantu.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prediction:"",
    img_src:"",
    img_height:"",
    display:"none"
  },
  history(){
    var count = app.count;
    var pred = app.pred;
    var beauty = app.beauty;
    var c=0;
    var that = this;
    var pre = pred[c];
    var highest=0;
    c++;
    for(c;c<count;c++){
      if(beauty[c]>beauty[highest]){
        highest = c;
      }
      pre += "\n";
      pre += "------------------\n";
      pre += "------------------\n";
      pre += pred[c];
    }
    that.setData({
      img_src:app.img_src[highest],
      img_height:app.height[highest]
    })
    console.log(app.height);
    highest++;
    pre += "\n";
    pre += "\n";
    pre += "您上传的图片中第";
    pre += highest;
    pre += "张图片最好看噢";
    console.log(pre);
    that.setData({
      prediction:pre,
      display:"block"
    })
  }

})