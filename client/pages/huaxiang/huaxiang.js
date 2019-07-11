Page({
  data: {
    age: "请稍等", //前端展示人脸检测数据
    glasses: "请稍等", //前端展示人脸检测数据
    beauty: "请稍等", //前端展示人脸检测数据
    mask: "请稍等", //前端展示人脸检测数据
    hat: "请稍等", //前端展示人脸检测数据
    gender: "请稍等", //前端展示人脸检测数据
    hair_length: "请稍等", //前端展示人脸检测数据
    hair_bang: "请稍等", //前端展示人脸检测数据
    hair_color: "请稍等", //前端展示人脸检测数据
    image_src: "cloud://test-7sj42.7465-test-7sj42/img/QQ截图20190705105052.png", //LOGO地址
    canvas_height: 144, //前端canvas默认高度
    image_viwe_display: "block", //前端图片默认展示状态，修复canvas无法在真机展示部分图片。
    canvas_viwe_display: "none", //前端canvas默认展示状态，修复canvas无法在真机展示部分图片。
    text_viwe_display: "none", //前端人脸检测展示状态
    button_viwe_display: "none", //前端按钮展示状态
    UpdateImage: "请上传照片", //前端上传图片文字数据
    ImageFileID: "", //图片文件FileID
    ImagetempFilePaths: "" //图片文件本地临时地址
  },
  UploadImage() {
    var myThis = this
    var random = Date.parse(new Date()) + Math.ceil(Math.random() * 1000) //随机数
    wx.chooseImage({ //图片上传接口
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(chooseImage_res) {
        wx.showLoading({ //展示加载接口
          title: '加载中...',
        });
        wx.getImageInfo({ //图片属性接口
          src: chooseImage_res.tempFilePaths[0], //地址为选择图片后在本地的临时文件
          success(getImageInfo_res) {
            var ctx_size = 250 / getImageInfo_res.width;
            // 获取上传后图片宽度与200的比值
            const ctx = wx.createCanvasContext('Canvas');
            const image = chooseImage_res.tempFilePaths[0]; //设置图片地址为选择图片后在本地的临时文件
            ctx.drawImage(image, 0, 0, 250, getImageInfo_res.height * ctx_size); //选择的图片高度与宽度/200后比值做乘积，得到符合前端canvas正常高度
            myThis.setData({
              canvas_height: getImageInfo_res.height * ctx_size, //将canvas正常高度写给前端canvas，以避免图片拉伸
              image_viwe_display: "none", //关闭前端图片展示
              canvas_viwe_display: "block", //打开前端canvas展示
            })
            ctx.draw(); //绘制基本图片
          }
        })
        console.log("临时地址:" + chooseImage_res.tempFilePaths[0])
        myThis.setData({
          UpdateImage: "上传进度", //选择图片后将“请上传照片”更改为“上传进度”
          ImagetempFilePaths: chooseImage_res.tempFilePaths[0] //将选择图片后的临时地址写给ImagetempFilePaths等待其他函数调用
        })
        const uploadTask = wx.cloud.uploadFile({ //云存储上传接口
          cloudPath: random + '.png', //将图片上传后名称为随机数 + .png
          filePath: chooseImage_res.tempFilePaths[0], //将临时地址中的图片文件上传到云函数文件服务器
          success(uploadFile_res) {
            myThis.setData({
              ImageFileID: uploadFile_res.fileID //将上传图片后的fileID写给ImageFileID等待其他函数调用
            })
            wx.hideLoading() //关闭加载中弹窗
            wx.showToast({ //显示弹窗
              title: '上传成功',
              icon: 'success',
              duration: 500
            })
          }
        })
        uploadTask.onProgressUpdate((uploadFile_res) => { //监控上传进度函数
          myThis.setData({
            progress: uploadFile_res.progress //上传进度
          })
        })
      }
    })
  },



  AnaltzeFace() { //五官定位函数
    wx.showLoading({
      title: '请稍后...',
    });
    var myThis = this
    myThis.setData({
      text_viwe_display: "none"
    });
    var image_src = this.data.ImagetempFilePaths
    wx.cloud.callFunction({ //调用五官定位云函数
      name: 'AnalyzeFace',
      data: {
        fileID: this.data.ImageFileID //读取上传图片成功后返回的FileID
      },
      success(cloud_callFunction_res) { //成功回调
        wx.hideLoading()
        console.log("AnalyzeFace:" + JSON.stringify(cloud_callFunction_res.result)) //展示返回的json数据
        var ctx_size = 250 / cloud_callFunction_res.result.ImageWidth;
        //这里的数值是五官定位返回的图片宽度，同上，获取比值
        const ctx = wx.createCanvasContext('Canvas');
        ctx.drawImage("../../libs/img/timg.jpg", 0, 0, 250, cloud_callFunction_res.result.ImageHeight * ctx_size);
        myThis.setData({
          canvas_height: cloud_callFunction_res.result.ImageHeight * ctx_size, //正确高度写给前端
          image_viwe_display: "none", //关闭前端图片展示
          canvas_viwe_display: "block", //打开前端canvas展示
        })
        ctx.setStrokeStyle('#0000FF') //五官定位数据绘图颜色
        ctx.beginPath() //设置画笔

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].FaceProfile[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].FaceProfile[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].FaceProfile.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].FaceProfile[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].FaceProfile[i].Y * ctx_size)
        } //脸型轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].LeftEye[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].LeftEye[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].LeftEye.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].LeftEye[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].LeftEye[i].Y * ctx_size)
        } //左眼轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].RightEye[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].RightEye[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].RightEye.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].RightEye[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].RightEye[i].Y * ctx_size)
        } //右眼轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].LeftEyeBrow[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].LeftEyeBrow[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].LeftEyeBrow.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].LeftEyeBrow[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].LeftEyeBrow[i].Y * ctx_size)
        } //左眉毛轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].RightEyeBrow[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].RightEyeBrow[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].RightEyeBrow.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].RightEyeBrow[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].RightEyeBrow[i].Y * ctx_size)
        } //右眉毛轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].Mouth[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].Mouth[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].Mouth.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].Mouth[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].Mouth[i].Y * ctx_size)
        } //嘴巴轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].Nose[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].Nose[0].Y * ctx_size)
        for (var i = 1; i < cloud_callFunction_res.result.FaceShapeSet[0].Nose.length; i++) {
          ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].Nose[i].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].Nose[i].Y * ctx_size)
        } //鼻子轮廓绘制

        ctx.moveTo(cloud_callFunction_res.result.FaceShapeSet[0].LeftPupil[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].LeftPupil[0].Y * ctx_size)
        ctx.lineTo(cloud_callFunction_res.result.FaceShapeSet[0].RightPupil[0].X * ctx_size, cloud_callFunction_res.result.FaceShapeSet[0].RightPupil[0].Y * ctx_size)
        //瞳孔距离绘制
        ctx.stroke();
        ctx.draw();
      },
      fail(err) { //失败回调
        console.log(err)
        wx.hideLoading()
        wx.showModal({
          title: '失败',
          content: "五官定位失败，请重试！"
        })
      }
    })
  },



  onLoad: function () {
    wx.cloud.init({
      env: 'test-7sj42' //云函数环境
    })
  }
})