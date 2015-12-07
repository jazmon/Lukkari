var admobid = {};
// if (/(android)/i.test(navigator.userAgent)) {
  admobid = { // for Android
    banner: 'ca-app-pub-8132766172419709/8791445675',
    interstitial: 'ca-app-pub-8132766172419709/2744912070'
  // };
// } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
//   admobid = { // for iOS
//     banner: 'ca-app-pub-6869992474017983/4806197152',
//     interstitial: 'ca-app-pub-6869992474017983/7563979554'
//   };
// } else {
  // admobid = { // for Windows Phone
  //   banner: 'ca-app-pub-6869992474017983/8878394753',
  //   interstitial: 'ca-app-pub-6869992474017983/1355127956'
  // };
}

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
    autoShow: true
  });
}
