<template>
  <div class="login">
    <div class="login-header">
      <getechHeader @logoClick="goToHomePage" />
    </div>
    <div ref="loginContent" class="login-content">
      <loginFrom />
    </div>
    <div class="login-footer">
      <copyRight />
    </div>
  </div>
</template>

<script>
  import lottie from 'lottie-web';
  import animationJson from '@/static/animation/login/login.json';
  import getechHeader from './components/getechHeader';
  import loginFrom from './components/loginFrom';
  import copyRight from './components/copyRight';
  import loginMixins from './mixins';

  export default {
    mixins: [loginMixins],
    components: {
      getechHeader,
      loginFrom,
      copyRight
    },
    mounted() {
      // 动画
      lottie.loadAnimation({
        container: this.$refs.loginContent,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationJson,
        assetsPath: '/auth/static/animation/login/'
      });
    }
  };
</script>

<style lang="less" scoped>
  .login {
    display: flex;
    flex-direction: column;
    height: 100%;

    /deep/ .login-content {
      height: calc(100% - 104px);
      background: url('~@img/login/bg.png') no-repeat center center;
      background-size: 100% 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      > svg {
        margin-left: 3%;
        width: 50% !important;
        height: auto !important;
      }
    }

    .login-footer{
      position: fixed;
      bottom: 0;
      width: 100%;
    }
  }
</style>
