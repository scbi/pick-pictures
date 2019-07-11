var app = getApp();
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
    image_src: "cloud://test-7sj42.7465-test-7sj42/img/QQ截图20190704110133.png", //LOGO地址
    canvas_height: 127, //前端canvas默认高度
    image_viwe_display: "block", //前端图片默认展示状态，修复canvas无法在真机展示部分图片。
    canvas_viwe_display: "none", //前端canvas默认展示状态，修复canvas无法在真机展示部分图片。
    text_viwe_display: "none", //前端人脸检测展示状态
    button_viwe_display: "none", //前端按钮展示状态
    UpdateImage: "请上传照片", //前端上传图片文字数据
    ImageFileID: "", //图片文件FileID
    ImagetempFilePaths: "" ,//图片文件本地临时地址,
    prediction:"皮皮检测结果会在这里显示噢"//前端显示结果
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
            // 获取上传后图片宽度与250的比值
            const ctx = wx.createCanvasContext('Canvas');
            const image = chooseImage_res.tempFilePaths[0]; //设置图片地址为选择图片后在本地的临时文件
            ctx.drawImage(image, 0, 0, 250, getImageInfo_res.height * ctx_size); //选择的图片高度与宽度/250后比值做乘积，得到符合前端canvas正常高度
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




  DetectFace() { //人脸检测函数
    var age="";
    var gender="";
    var beauty="";
    var hair_length= "";
    var hair_bang=""; 
    var hair_color="";
    var pingjia="";
    var nichen="";
    wx.showLoading({
      title: '请稍后...',
    });
    var myThis = this
    myThis.setData({
      text_viwe_display: "block" //展示人脸检测相关数据
    });
    var image_src = this.data.ImagetempFilePaths
    var img_height = "";
    wx.getImageInfo({
      src: image_src,
      success(getImageInfo_res) {
        var ctx_size = 250 / getImageInfo_res.width;
        const ctx = wx.createCanvasContext('Canvas');
        ctx.drawImage(image_src, 0, 0, 250, getImageInfo_res.height * ctx_size);
        myThis.setData({
          canvas_height: getImageInfo_res.height * ctx_size,
          image_viwe_display: "none", //关闭前端图片展示
          canvas_viwe_display: "block", //打开前端canvas展示
        })
        img_height = getImageInfo_res.height * ctx_size;
        ctx.draw();
      }
    })
    wx.cloud.callFunction({ //人脸检测云函数
      name: 'DetectFace',
      data: {
        fileID: this.data.ImageFileID //上传成功文件的fileID
      },
      success(cloud_callFunction_res) {
        wx.hideLoading()
        console.log("FaceInfos:" + JSON.stringify(cloud_callFunction_res.result)) //人脸检测返回的json数据
        myThis.setData({
          age: cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Age, //年龄
          glasses: cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Glass, //是否带眼镜
          beauty: cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Beauty, //颜值数据
          mask: cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Mask, //是否遮挡
          hat: cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Hat, //是否带帽子
        })
        age = cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Age;
        beauty = cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Beauty

        if (cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Gender < 50) { //判断数据返回的数据，更新性别变量
          gender = "女"
        } else {
          gender = "男"
        }

        switch (cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Hair.Length) { //判断数据返回的数据，更新头发变量
          case 0:
            hair_length="光头";
            break;
          case 1:
            hair_length="短发";
            break;
          case 2:
            hair_length="中发";
            break;
          case 3:
            hair_length="长发";
            break;
          case 4:
            hair_length="绑发";
            break;
        }

        switch (cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Hair.Bang) { //判断数据返回的数据，更新刘海变量
          case 0:
            hair_bang="有刘海的";
            break;
          case 1:
            hair_bang="无刘海的";
            break;
        }

        switch (cloud_callFunction_res.result.FaceInfos[0].FaceAttributesInfo.Hair.Color) { //判断数据返回的数据，更新发色变量
          case 0:
            hair_color="黑色";
            break;
          case 1:
            hair_color="金色";
            break;
          case 2:
            hair_color="棕色";
            break;
          case 3:
            hair_color="灰白色";
            break;
        }
        if(gender == "男"){
          if (age <= 8){
            nichen="小弟弟";
          }
          else if (age <= 23){
            nichen = "小哥哥";
          }
          else if (age <= 45) {
            nichen = "叔叔";
          }
          else  {
            nichen = "老爷爷";
          }
        }
        else{
          if (age <= 8) {
            nichen = "小妹妹";
          }
          else if (age <= 23) {
            nichen = "小姐姐";
          }
          else if (age <= 45) {
            nichen = "美丽的阿姨";
          }
          else {
            nichen = "年轻的奶奶";
          }
        }
        if (beauty == 100){
          pingjia ="神级照片，颜值爆表，胜过百万修图师"
        }
        else if (beauty >= 90){
          pingjia = "简直就是精修图级别的照片"
        }
        else if (beauty >= 80){
          pingjia = "高分照片，赶快晒到朋友圈吧"
        }
        else if (beauty >= 60){
          pingjia = "略有不足但是肉眼看不出瑕疵可以放心"
        }
        else{
          pingjia = "水平一般般，建议悄悄保存，晒图需谨慎"
        }
        myThis.setData({
          prediction: "皮皮检测到这是一位" + nichen + "，预测年龄为" + age + "，发型为" + hair_bang + hair_length + "，发色是" + hair_color + "，最终形象评分为" + beauty + "，" + pingjia
        })
        app.pred[app.count] = "皮皮检测到这是一位" + nichen + "，预测年龄为" + age + "，发型为" + hair_bang + hair_length + "，发色是" + hair_color + "，最终形象评分为" + beauty + "，" + pingjia;
        app.beauty[app.count] = parseInt(beauty);
        app.img_src[app.count] = image_src;
        app.height[app.count] = img_height;
        app.count++;
        console.log(app.pred[app.count]);
      },
      fail(err) { //失败回调函数
        console.log(err)
        wx.hideLoading()
        wx.showModal({
          title: '失败',
          content: "人脸检测失败，请重试！"
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