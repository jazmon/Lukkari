var admobid = {};
admobid = {
  banner: 'ca-app-pub-8132766172419709/8791445675',
  interstitial: 'ca-app-pub-8132766172419709/2744912070'
};

if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
  document.addEventListener('deviceready', initApp, false);
} else {
  initApp();
}

function initApp() {
  AdMob.createBanner({
    adId: admobid.banner,
    isTesting: true,
    overlap: false,
    offsetTopBar: false,
    position: AdMob.AD_POSITION.BOTTOM_CENTER,
    bgColor: 'black'
  });

  AdMob.prepareInterstitial({
    adId: admobid.interstitial,
    autoShow: false
  });
}
