<template>
  <div class="clothing" id="clothing-v" @click="handleClick">
    <canvas style="display: none" id="canvasCamera"></canvas>
    <div class="overlay" v-if="qrCode"></div>
    <div v-if="qrCode" class="win-erweima">
      <img :src="qrCode" style="width: 100%;height: 100%;border: 1px #CCCCCC solid;" alt="QR Code" />
    </div>
    <div class="win-up" style="z-index: 1">
      <div class="win-show">
        <img
            v-if="!canvas"
            class="win-photo"
            :src=outUrl
        >
        <video ref="video" v-if="canvas"></video>
      </div>
      <div class="all-button">
        <img
            class="win-button"
            src="@/assets/shexiangtou.png"
            @click="OpenCamera"
        ><img
          class="win-button"
          src="@/assets/photograph.png"
          @click="setImage"
      ><img
          class="win-button"
          src="@/assets/dowlond.png"
          @click="generateQRCode"
      >
      </div>
    </div>
    <div class="win-down">
      <div class="gundong">
        <img
          src="@/assets/preImg.png"
          class="control-img pre-img"
          @click="prevImage">

      <img
          src="@/assets/nexImg.png"
          class="control-img nex-img"
          @click="nextImage">
        <div class="topgun">
          <div ref="scrollContainer" class="scroll-container">
            <!-- 初始图片 -->
            <div
                v-if="sex='girl'"
                class="smallbox"
                v-for="(item, index) in images"
                :key="index"
            >
              <img :src="item.src" class="slide-image"  />
            </div>
            <div
                v-if="sex='boy'"
                class="smallbox"
                v-for="(item, index) in images"
                :key="index"
            >
              <img :src="item.src" class="slide-image" />
            </div>
        </div>
      </div>
    </div>
    <div class="all-sex">
  <img
      class="sex-button"
      src="@/assets/boy.png"
      @click="boySex"
      :class="{'bigsex': isBoyBig}"
  ><img
    class="sex-button"
    src="@/assets/girl.png"
    @click="girlSex"
    :class="{'bigsex': isGirlBig}"
>
</div>
  </div>
  </div>
</template>

<script>
import QRCode from "qrcode";
import {sentClothImg} from "../api/index";
import axios from 'axios';
let inputElement = null;
export default {
  data() {
    return {
      girlimages: [
        { src: require("@/assets/girl/girl1.png") },
        { src: require("@/assets/girl/girl2.png") },
        { src: require("@/assets/girl/girl3.png") },
        { src: require("@/assets/girl/girl4.png") },
      ],
      boyimages: [
        { src: require("@/assets/boy/boy1.jpg") },
        { src: require("@/assets/boy/boy2.jpg") },
        { src: require("@/assets/boy/boy3.jpg") },
      ],
      images:[],
      sex:'girl',
      qrCode: "", // 这个是二维码图片的url
      scrollSpeed: 0.5, // 控制滚动的速度
      scrollPosition: 0, // 当前滚动位置
      selectStyle: null, // 当前选择的图片索引
      clearTimer: null, // 用来存储清除二维码的定时器
      outUrl:require("@/assets/show.jpg"),
      valueUrl:'',
      isImg: false,  // 控制加载动画显示与隐藏
      style: "",
      mediaStreamTrack: {},
      video_stream: '', // 视频stream
      imgSrc: '', // 拍照图片
      canvas: null,
      context: null,
      isBoyBig:false,
      isGirlBig:true
    };
  },
  mounted() {
    this.setImages();
    this.getImageBase64();
  },
  methods: {
    setImages() {
      // 根据 sex 设置 images 的值
      if (this.sex === 'girl') {
        this.images = this.girlimages;
      } else if (this.sex === 'boy') {
        this.images = this.boyimages;
      }
    },
    boySex() {
  this.sex = 'boy'
  this.isBoyBig = true;  // 设置 boy 按钮需要放大
  this.isGirlBig = false;
  this.setImages();
},
girlSex() {
  this.sex = 'girl'
  this.isBoyBig = false;  // 设置 boy 按钮需要放大
  this.isGirlBig = true;
  this.setImages();
},
    generateQRCode(event) {
      const link = document.createElement('a');
      link.href = this.outUrl;
      // 生成二维码逻辑(参数指定url文字即可)
      QRCode.toDataURL(link.href)
          .then(async (qr) => {
            this.qrCode = qr; // 设置二维码图片

            // 每次生成二维码时，启动一个新的计时器，5秒后清除二维码
            this.startClearTimer();
          })
          .catch((error) => {
            console.error("生成二维码出错：", error);
          });
      // 阻止点击二维码按钮时事件传播，防止触发页面上的点击事件
      event.stopPropagation();
    },

    // 启动清除二维码的定时器
    startClearTimer() {
      // 如果已有定时器，清除它
      if (this.clearTimer) {
        clearTimeout(this.clearTimer);
      }

      // 设置一个 5 秒后清除二维码的定时器
      this.clearTimer = setTimeout(() => {
        this.qrCode = ""; // 清除二维码
      }, 10000); // 5秒后清除二维码
    },

    // 监听页面点击事件，点击时重置定时器
    handleClick(event) {
      // 判断点击的区域是否是二维码区域，如果是就不清除二维码，否则清除
      const qrCodeElement = this.$el.querySelector('.win-erweima');

      // 判断点击是否在二维码外
      if (qrCodeElement && !qrCodeElement.contains(event.target)) {
        this.qrCode = ""; // 清除二维码
      }

      // 每次点击时，重置计时器，防止自动清除二维码
      this.startClearTimer();
    },

    nextImage() {
      const scrollContainer = this.$refs.scrollContainer;
      const imageWidth = scrollContainer.children[0].offsetWidth; // 获取单张图片的宽度

      // 将第一张图片移到最后
      const lastImage = this.images.pop();
      this.images.unshift(lastImage);

      // 判断是否超出范围，调整位置
      if (this.scrollPosition <= -imageWidth * this.images.length) {
        this.scrollPosition = 0; // 如果滚动超出范围，重置滚动位置
      }
    },

    // 向左滚动（点击 preImg）
    prevImage() {
      const scrollContainer = this.$refs.scrollContainer;
      const imageWidth = scrollContainer.children[0].offsetWidth; // 获取单张图片的宽度

      // 将最后一张图片移到最前面
      const firstImage = this.images.shift();
      this.images.push(firstImage);


      // 判断是否超出范围，调整位置
      if (this.scrollPosition >= 0) {
        this.scrollPosition = -imageWidth * (this.images.length - 1); // 如果回到第一张，设置为最后一张
      }
    },
    sentImage(){
      if (!this.valueUrl) {
        this.$message.error('请先上传图片');
        return;
      }
      if(this.style==''){
        this.$message.error('请先选择背景');
      }else{
        sentClothImg({
          image: this.valueUrl.split(',')[1],
          style: this.style.split(',')[1],
          headers: {
      'Content-Type': 'application/json' // 指定请求的内容类型
    }
        })
            .then(response => {
              this.isImg = true
              const stylizedImage = response.data.base64_image;
              
              this.outUrl = 'data:image/jpeg;base64,' + stylizedImage;
            })
            .catch(error => {
              this.loading = false;
              console.error('Error uploading image: ', error);
            });
      }
    },
    getCamera() {
      // 获取 canvas 画布
      this.canvas = document.getElementById('canvasCamera');
      this.context = this.canvas.getContext('2d');
      // 旧版本浏览器可能根本不支持mediaDevices，我们首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      // 正常支持版本
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
          .then((stream) => {
          // 摄像头开启成功
          this.mediaStreamTrack = typeof stream.stop === 'function' ? stream : stream.getTracks()[0];
          this.video_stream = stream;
          this.$refs.video.srcObject = stream;
          this.$refs.video.play();
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 拍照 绘制图片
    setImage() {
      this.getImageBase64();
      console.log('拍照');
      // 点击canvas画图
      this.context.drawImage(
        this.$refs.video,
        0,
        0,
        200,
        100,
      );
      // 获取图片base64链接
      const image = this.canvas.toDataURL('image/png');
      this.imgSrc = image;
      this.valueUrl = this.imgSrc
      this.$emit('refreshDataList', this.imgSrc);
      this.sentImage();
      this.CloseCamera()
      this.canvas=null
    },
    // 打开摄像头
    OpenCamera() {
      console.log('打开摄像头');
      this.getCamera();
    },
    // 关闭摄像头
    CloseCamera() {
      console.log('关闭摄像头');
      this.$refs.video.srcObject.getTracks()[0].stop();
    },
    // async getImageBase64() {
    async getImageBase64() {

      try {
        const randomIndex = Math.floor(Math.random() * this.images.length); // 获取随机索引
        const randomImage = this.images[randomIndex].src; // 获取随机图片路径
        // 使用 axios 获取图片内容，设置响应类型为 'arraybuffer'
        const response = await axios.get(randomImage, {
          responseType: 'arraybuffer' // 这样可以获取二进制数据
        });

        // 将返回的图片数据（Buffer）转换为 base64 编码
        const base64Image = this.arrayBufferToBase64(response.data);
        this.style = base64Image
        console.log(base64Image); // 输出 base64 编码字符串
      } catch (error) {
        console.error('获取图片失败：', error);
      }
    },

    // 将 ArrayBuffer 转换为 base64 编码
    arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const length = bytes.length;

      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      return `data:image/jpeg;base64,${window.btoa(binary)}`;
    }
  },
};
</script>

<style scoped>
.clothing {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
}

#clothing-v {
  background: url("@/assets/background.jpg");
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
}

.win-up {
  width: 100%;
  height: 55%;
  margin-top: 9%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.win-down {
  margin-top: 1.5%;
  margin-left: 1%;
  width: 100%;
  height: 25%;
  margin-bottom: 0.5%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.win-button {
  width: 13.09vw;
  height: 9.3vh;
  cursor: pointer;
}

.win-show {
  width: 80%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.all-button {
  width: 20%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-end;
}

.win-photo {
  width: 46.4vw;
  height: 54.37vh;
}

.win-erweima {
  position: absolute;
  top: 50vh;
  left: 50%;
  width: 32.72vw;
  height: 32.72vw;
  transform: translate(-50%, -50%);
  z-index: 9999;
}

.overlay {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.gundong {
  width: 76%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: white;
  border-radius: 1vw;
}

.topgun {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.scroll-container {
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.2s ease-out;
}

.smallbox {
  margin-left: 1vh;
  width: 24.15%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 0 0 auto;
}

img.slide-image {
  border: 0.2vw solid transparent;
  width: 100%;
  height: 80%;
  cursor: pointer;
}

.control-img {
  height: 25%;
  width: 5%;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 10;
}
.control-img:hover{
  cursor: pointer;
}
.pre-img {
  left: 0;
}

.nex-img {
  right: 0;
}
video {
  width: 46.4vw;
  height: 54.37vh;
}
.all-sex{
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 20%;
}
.sex-button{
  width: 3.9vw;
  height: 7.75vh;
  cursor: pointer;
}
.bigsex{
  transform: scale(1.1);
}
</style>
