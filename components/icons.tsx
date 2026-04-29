/**
 * Strategic Command – Material Icons
 * Wygenerowane z Figma MCP – 107 ikon jako osobne komponenty React
 *
 * Użycie:
 *   import { MArrowUp, MLogout, MSearch } from './icons'
 *
 * Każda ikona przyjmuje opcjonalny prop `className` (domyślnie: "relative size-[24px]")
 * Ikony renderują SVG przez asety z lokalnego serwera Figma (localhost:3845).
 * W środowisku produkcyjnym zamień URL-e na własne CDN/public assets.
 */

import React from "react";

// ─── Asset URLs ───────────────────────────────────────────────────────────────

const MASK  = "http://localhost:3845/assets/6b9c20f63b370e46c12f0942c046d011af5d6798.svg";
const MASK2 = "http://localhost:3845/assets/d8940e916ba2c533ac3cf8007ee163af49417265.svg";
const MASK3 = "http://localhost:3845/assets/c41956dd45c9feacd7d978ec37453d178714eaa6.svg";
const MASK4 = "http://localhost:3845/assets/2b31653871a1dad419d52f3b72e822d5f4239898.svg";
const MASK5 = "http://localhost:3845/assets/938fc48abcfefff62bd2ec9946bcf8196dc22b02.svg";
const MASK6 = "http://localhost:3845/assets/58ece2ede3e71ceb25ba0ea1c7bc95e7f2d2a8e2.svg";

// Icon fill assets
const ASSETS: Record<string, string> = {
  arrowUp:              "http://localhost:3845/assets/510c1f8506c6e11bc8e6d3bc2528744cd8fda87b.svg",
  arrowDown:            "http://localhost:3845/assets/56c267835b90822936e85a1bb213740b77966441.svg",
  arrowLeft:            "http://localhost:3845/assets/b07640e0895280620e329bc102943069892748c2.svg",
  arrowRight:           "http://localhost:3845/assets/a5f0e947df4d8ffcfa87f5f613c98fb106ba5d2a.svg",
  close:                "http://localhost:3845/assets/4501d5316b5ae63597689471b827c5477acae22a.svg",
  check:                "http://localhost:3845/assets/a172faea945ce55cf8e72d27c788f957fb7c7a2a.svg",
  add:                  "http://localhost:3845/assets/dea1162775545ccda8ebb11c4f1dc1bed125bbb3.svg",
  minus:                "http://localhost:3845/assets/303db28ab8e797c9da5873fcf5906f65cd44a8f2.svg",
  refresh:              "http://localhost:3845/assets/ac4f9bbdb8d46779828860cda8b24afd3a9cc3bc.svg",
  help:                 "http://localhost:3845/assets/637b8c2826ea46069c45aecff6038adb9e357342.svg",
  warning:              "http://localhost:3845/assets/20084f0f28cfe0350e9f0e08409c1a7a10a5f905.svg",
  warningFill:          "http://localhost:3845/assets/163012e2fad028b9eb3c82c3e5c24bcdad2a3064.svg",
  checkCircle:          "http://localhost:3845/assets/0b3182b48ceb46cf26dee56795751b80e7603e00.svg",
  cancel:               "http://localhost:3845/assets/ea1de67e18dd6b243f83390a81ee8ebb5d4bd90d.svg",
  info:                 "http://localhost:3845/assets/97f7134aa146b1296835a50f25d78a36d4aeca97.svg",
  info2:                "http://localhost:3845/assets/928164e821054809e8af601137ae37e7af7db1da.svg",
  alarm:                "http://localhost:3845/assets/c45d87754a809424b79c61aba901301975f47037.svg",
  map:                  "http://localhost:3845/assets/d2688b6315865f9358a4c92b1ee1314bc06ec673.svg",
  groups:               "http://localhost:3845/assets/378e7dd2353f34742922d6af7166e95dfcff90f6.svg",
  myLocation:           "http://localhost:3845/assets/25b8a73791b514672481c084aab0c4905e714846.svg",
  carCrash:             "http://localhost:3845/assets/442ae5d12fe06382f4084c25587949ed05c08f84.svg",
  security:             "http://localhost:3845/assets/3998bba2bb6e0e15667f798606e3713774bf681c.svg",
  myLocation2:          "http://localhost:3845/assets/5bb396999952c3b4f922b793ded9f011c3621768.svg",
  badge:                "http://localhost:3845/assets/2b31653871a1dad419d52f3b72e822d5f4239898.svg",
  medicalServices:      "http://localhost:3845/assets/ea0f1c7392de0e5aff7c82c8f9bc6e198ca3ad94.svg",
  directionsCar:        "http://localhost:3845/assets/36534fce1fb1a79a7ace04bcf42ec3c5b578d892.svg",
  visibility:           "http://localhost:3845/assets/11ee42759b06e966f413f59a76d641f3c08e9dda.svg",
  locked:               "http://localhost:3845/assets/c801ebcbba39bd25372dde86ee1dcebcddd6de22.svg",
  lockOpen:             "http://localhost:3845/assets/357e21079c476059dc286297c41ec7607eec1c35.svg",
  filterHdr:            "http://localhost:3845/assets/d5c53baaf96f1713b336b89abfb61c78f0585831.svg",
  gridOn:               "http://localhost:3845/assets/61eee8841a535a43041223a938eb98fc9bc02aac.svg",
  apartment:            "http://localhost:3845/assets/2a8f8375fc3a051f2ba7871b2dbb78bc38469e3b.svg",
  localShipping:        "http://localhost:3845/assets/140012bce91dbb0f865366685fa6e58f8ba23885.svg",
  folder:               "http://localhost:3845/assets/77dea8d0199c6ec93ab475c0962e275dc3726d68.svg",
  idCard:               "http://localhost:3845/assets/60e58f3dc76ae443a30d6c716b6cc1fd98435dcc.svg",
  rocketLaunch:         "http://localhost:3845/assets/f2227620707d92b53564ee524bca05c2cf217205.svg",
  bolt:                 "http://localhost:3845/assets/38ac2b7bc99d8d483c263b370122e96daa5cf561.svg",
  waterDrop:            "http://localhost:3845/assets/d832cf063eb62c467857e0d6d5844ee07fb5bf30.svg",
  wc:                   "http://localhost:3845/assets/c976587beb1478fc4c62ff073107c9025a893e3f.svg",
  playArrow:            "http://localhost:3845/assets/453bbf4101cd39822522deb457dbe08b9b5eb5e3.svg",
  bluetooth:            "http://localhost:3845/assets/af9a9f19cf12f7eafdf6d96ff3013e4f51a00933.svg",
  nearMe:               "http://localhost:3845/assets/9fd0494f2e4e3ee90cc1a4266a4e4af517ab8dc3.svg",
  devices:              "http://localhost:3845/assets/55fe9921d26118fbd3b69ce270b739f61c9a6fcb.svg",
  progressActivity:     "http://localhost:3845/assets/346b3824e4a9eea4b8b4c4ef88995d02e11a3857.svg",
  cable:                "http://localhost:3845/assets/d38908d192e8ac77de1e5df35cbec5e42597ee08.svg",
  partlyCloudyDay:      "http://localhost:3845/assets/bfc88157f94c6205d76a8aca3ba19063717de02a.svg",
  deskphone:            "http://localhost:3845/assets/e9aeeaaf0e75d633a136ebb9f31431f49cd6628f.svg",
  destruction:          "http://localhost:3845/assets/7a4cee316158cbd8c224fe83bbc000d0f0cfb57c.svg",
  road:                 "http://localhost:3845/assets/0b233797ccd9be0787dd8a874acc612b20534a7e.svg",
  zonePersonUrgent:     "http://localhost:3845/assets/4e1f33678c4d090978bfe1da57b60b0ea8e378dc.svg",
  timelapse:            "http://localhost:3845/assets/627cd959da12c25e7b6a5ba0043c1888d27d8ff6.svg",
  waterBottleLarge:     "http://localhost:3845/assets/116b8d9416f15a547dd9a01f73a42e93e0cebe9f.svg",
  hourglassTop:         "http://localhost:3845/assets/e54291428cd037d543afac96b02939fb4c94db1d.svg",
  darkMode:             "http://localhost:3845/assets/72d7cd25e123256365af779c49baf53069874c23.svg",
  lightMode:            "http://localhost:3845/assets/1556168bdb6d05c9a1863fe68ccc58a4dad444e6.svg",
  battery0Bar:          "http://localhost:3845/assets/c33193f1f94f81e373fca45b490b563ea2eeeb87.svg",
  battery2Bar:          "http://localhost:3845/assets/110b2e99420f06e58120046ee2853ac1bbaf6149cd.svg",
  battery6Bar:          "http://localhost:3845/assets/846029bc30e32e3acc184fa1156bb5bc04c2e3c5.svg",
  batteryFull:          "http://localhost:3845/assets/e54291428cd037d543afac96b02939fb4c94db1d.svg",
  logout:               "http://localhost:3845/assets/72d7cd25e123256365af779c49baf53069874c23.svg",
  link:                 "http://localhost:3845/assets/1556168bdb6d05c9a1863fe68ccc58a4dad444e6.svg",
  locationOn:           "http://localhost:3845/assets/c33193f1f94f81e373fca45b490b563ea2eeeb87.svg",
  localFireDepartment:  "http://localhost:3845/assets/fb836e7c63ff0cd3dbb3df6039ad660dc1d8d901.svg",
  questionMark:         "http://localhost:3845/assets/fba7c9f3c1a98c6d445e86813e25cdbd25cb4dee.svg",
  pause:                "http://localhost:3845/assets/107d2f4b9a093e93379ee1b05948fa952c239050.svg",
  lockClock:            "http://localhost:3845/assets/03a9916c99436ce2d3f4a56d1c37a25f3d34331a.svg",
  replay10:             "http://localhost:3845/assets/98a614895f88957d39424bf98ea9e2a4a36eac1d.svg",
  forward10:            "http://localhost:3845/assets/97c289d241f796ad709daffc9832373880ecaf22.svg",
  nfc:                  "http://localhost:3845/assets/66076d899ce509c05f26eedf40b1a5b8c768b428.svg",
  password:             "http://localhost:3845/assets/5c26a89bfc625b66143cb5579014cd2f23d25e0c.svg",
  sort:                 "http://localhost:3845/assets/2eb19792e5a1ae246faf359aa05094ffd1b05f22.svg",
  watchVibration:       "http://localhost:3845/assets/101b2e99420f06e58120046ee2853ac1bbaf6149cd.svg",
  qrCodeScanner:        "http://localhost:3845/assets/78dfe4ea58d49090d3073aedcea10274b5baebaf.svg",
  keep:                 "http://localhost:3845/assets/a527f30e6dc02e2847c59f860acb22dba6486c7b.svg",
  dashboard:            "http://localhost:3845/assets/200407d82de0eead1a14cbf71199d2f7e2547e61.svg",
  groupAdd:             "http://localhost:3845/assets/97f7134aa146b1296835a50f25d78a36d4aeca97.svg",
  trackChanges:         "http://localhost:3845/assets/bdceab8970a9c4d7a14514bf4a5bd5908d72891e.svg",
  tabs:                 "http://localhost:3845/assets/e3c5eea2af952e9ddb8fa4f9cbaa2071ab8016a5.svg",
  person:               "http://localhost:3845/assets/289304aa8c4cb3563eec15c9d741c045b7c95d88.svg",
  insertChart:          "http://localhost:3845/assets/73ff2f4e5f16ca743fe1453b97148d3dae4b6427.svg",
  download:             "http://localhost:3845/assets/63c08dcffc46ee4f1d7ca0433ee750ae4f47799d.svg",
  delete:               "http://localhost:3845/assets/8e0d27288f49236c690c4fad08cfc565cf20a6a8.svg",
  edit:                 "http://localhost:3845/assets/01896366beef7960ceb0562eb0785266c292ca09.svg",
  traffic:              "http://localhost:3845/assets/82f508862695bcbc64f7535c58116ca065d18508.svg",
  stacks:               "http://localhost:3845/assets/e9e4858b8bc0c7038cfa554ebab409dea72bfe20.svg",
  save:                 "http://localhost:3845/assets/26a1f6d457c282f9cf4cdc81f4d832757bec1ad3.svg",
  photoCamera:          "http://localhost:3845/assets/6b236a452316de6c02ac79bf275a3beb39034830.svg",
  build:                "http://localhost:3845/assets/8d4658dba8a3f842298ae2ae658b079c1cf0b002.svg",
  stars:                "http://localhost:3845/assets/e104204b9a093e93379ee1b05948fa952c239050.svg",
  satelliteAlt:         "http://localhost:3845/assets/254db93ddc8ae9cb4ee5e17d2985be0c3133d079.svg",
  search:               "http://localhost:3845/assets/28882c5ad5c9a5214f3faf1112332ca7f1c9a1bb.svg",
  explore:              "http://localhost:3845/assets/b894ab637e2943e622ca8e38a2f3fa001b2df08a.svg",
  formatListBulleted:   "http://localhost:3845/assets/0f318d375afec2b64f5472846d75922b66020f46.svg",
  modeHeatOff:          "http://localhost:3845/assets/d7dde713727295fa84b17fd354d125ca274db621.svg",
  grenade:              "http://localhost:3845/assets/bb39aca4eac9b05691efa82195d94f1ce1d9bef7.svg",
  rotate:               "http://localhost:3845/assets/792e5b65f638db6335601e5aac589e292a27bffa.svg",
  crop:                 "http://localhost:3845/assets/2968b69a1d8f85f7356aaeac067172222e2f53c0.svg",
  lassoSelect:          "http://localhost:3845/assets/ff1f4c8290e83281e48b311781b52c961f840db1.svg",
  directionsWalk:       "http://localhost:3845/assets/64f2f4e5f16ca743fe1453b97148d3dae4b6427.svg",
  folderShared:         "http://localhost:3845/assets/289304aa8c4cb3563eec15c9d741c045b7c95d88.svg",
  calendarToday:        "http://localhost:3845/assets/73ff2f4e5f16ca743fe1453b97148d3dae4b6427.svg",
  movedLocation:        "http://localhost:3845/assets/b0e456b2a02fa0a85a2df4a4c9026d09b4facdaf.svg",
  petSupplies:          "http://localhost:3845/assets/61e10789b06e966f413f59a76d641f3c08e9dda.svg",
  filterAlt:            "http://localhost:3845/assets/24483e8845fc3deb9216b3a187faa41cfbc74a01.svg",
  menu:                 "http://localhost:3845/assets/9cf591eeb73e0e5bb839e3b7ebe18ed0d1b0a985.svg",
  helpClinic:           "http://localhost:3845/assets/cc4b147cf877775b0f7dc928b11fd2d30a858a96.svg",
  linesWide:            "http://localhost:3845/assets/c41956dd45c9feacd7d978ec37453d178714eaa6.svg",
  editSquare:           "http://localhost:3845/assets/9fabc7edc5654a12d91c1bc02dae2379565aad51.svg",
  dangerous:            "http://localhost:3845/assets/47177663dc24365acd31bab13ff0400663d5d7ae.svg",
  settingsAccountBox:   "http://localhost:3845/assets/bec8f7ecfda8e324ea6619bc7e0c50d0f438d677.svg",
  sync:                 "http://localhost:3845/assets/50b3687acd15465a3e687a47be7376d1484b1c5f85.svg",
  home:                 "http://localhost:3845/assets/83467acd15465a3e687a47be7376d1484b1c5f85.svg",
  screenShare:          "http://localhost:3845/assets/3c22998d96847269d26482cc57c3bfdd3006cf03.svg",
  directions:           "http://localhost:3845/assets/1bfbf693e3d98c5173242e614227758fc7dbf4d6.svg",
  installDesktop:       "http://localhost:3845/assets/46f2f4e5f16ca743fe1453b97148d3dae4b6427.svg",
  runningWithErrors:    "http://localhost:3845/assets/c69f2eab052c030585b3380c68f00f3ff0cdbecd.svg",
  airlineSeatFlat:      "http://localhost:3845/assets/d719c416e76ba1ea132e64be7d53211809852347.svg",
  skull:                "http://localhost:3845/assets/b9f8e04b0090b7cb0fbb13d31afdf9077d1d2a2c.svg",
  minkEraser:           "http://localhost:3845/assets/52c40c8b46d0933dee317d392cb98571881874ef.svg",
  framePerson:          "http://localhost:3845/assets/79f9d2ea9db4cff7d488001fe82db76b8bb8414f.svg",
  addPhotoAlternate:    "http://localhost:3845/assets/85051c654a8435989f86d5d3950853f582d8afac.svg",
  accessibility:        "http://localhost:3845/assets/e911bdf660c7a2fc43397983e6dd9f279f8e2962.svg",
  sentimentStressed:    "http://localhost:3845/assets/39c08dcffc46ee4f1d7ca0433ee750ae4f47799d.svg",
  apparel:              "http://localhost:3845/assets/8e0d27288f49236c690c4fad08cfc565cf20a6a8.svg",
  bookmarkStar:         "http://localhost:3845/assets/e9e4858b8bc0c7038cfa554ebab409dea72bfe20.svg",
  share:                "http://localhost:3845/assets/26a1f6d457c282f9cf4cdc81f4d832757bec1ad3.svg",
  distance:             "http://localhost:3845/assets/6b236a452316de6c02ac79bf275a3beb39034830.svg",
  verifiedUser:         "http://localhost:3845/assets/8d4658dba8a3f842298ae2ae658b079c1cf0b002.svg",
  flagCheck:            "http://localhost:3845/assets/e104204b9a093e93379ee1b05948fa952c239050.svg",
  arrowsOutput:         "http://localhost:3845/assets/254db93ddc8ae9cb4ee5e17d2985be0c3133d079.svg",
  inventory:            "http://localhost:3845/assets/ef307ee6de0a77041963dd6d6467975b1288f082.svg",
  error:                "http://localhost:3845/assets/2b902c8082390f83c38cc9e649e2d7600c0ed61f.svg",
  visibilityOff:        "http://localhost:3845/assets/255373e02f88ba155330014a21ad5ec56ee6dff1.svg",
  whereToVote:          "http://localhost:3845/assets/27a1f6d457c282f9cf4cdc81f4d832757bec1ad3.svg",
  notificationsActive:  "http://localhost:3845/assets/9cd059e4d5e2fc7570a0cd2d19aa159ddac46a7e.svg",
  assignment:           "http://localhost:3845/assets/208ee8c21792b9adb76bc718e57f6ca3b13f553f.svg",
  archive:              "http://localhost:3845/assets/3aa91b1a4f5b9d2c26de34923b8f6af8f80b921f.svg",
  send:                 "http://localhost:3845/assets/21a0d663fac3a2514150281dc.svg",
  gppBadAlt:            "http://localhost:3845/assets/4859dcabfc592def2a0d663fac3a2514150281dc.svg",
  imagesmode:           "http://localhost:3845/assets/20a0d663fac3a2514150281dc.svg",
  gppBad:               "http://localhost:3845/assets/43135b49d8cd42863ea239d2588f283597e1d1bf.svg",
  pending:              "http://localhost:3845/assets/c62f5199c55b78454d96e5c3186f31404005c102.svg",
  camping:              "http://localhost:3845/assets/19a0d663fac3a2514150281dc.svg",
  familyRestroom:       "http://localhost:3845/assets/6f484b39cf5eddc2b216775ec3566388f01fb8bf.svg",
  homeFill:             "http://localhost:3845/assets/bf4c1a4e8364cc9440c37be6450ef0bb034d6e9f.svg",
  moreVert:             "http://localhost:3845/assets/9eb7d2ea9db4cff7d488001fe82db76b8bb8414f.svg",
  notReady:             "http://localhost:3845/assets/a6bd5771f2fddad23c8d95523d5d2149926583e5.svg",
  ready:                "http://localhost:3845/assets/b7c8773f7b351d076536a5fd3ad7395c499a976e.svg",
  keyboardDoubleArrowLeft:  "http://localhost:3845/assets/36d34da1d2371ec4748d29c16fca8204583461a3.svg",
  keyboardDoubleArrowRight: "http://localhost:3845/assets/a3f7e074d1da5715870a4a237001b94c0286cc5a.svg",
  mail:                 "http://localhost:3845/assets/67125e2fd890a5b1b17ecbc36f041409e6faa54e.svg",
  starsAlt:             "http://localhost:3845/assets/6cd08db7dd468def2524a37fbaf761912790ef62.svg",
  schedule:             "http://localhost:3845/assets/cdbed51800eefebf52daae0cd773c9563ea7ea66.svg",
  settingsOutlined:     "http://localhost:3845/assets/846c2faed0c39a16202696dcc2f5a250b2c49cef.svg",
};

// ─── Base Icon component ──────────────────────────────────────────────────────

interface IconProps {
  className?: string;
}

// Simple masked icon (most common pattern)
function MaskedIcon({ src, mask = MASK2, className, style }: {
  src: string;
  mask?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className || "relative size-[24px]"}>
      <div
        className="absolute inset-[8.33%] mask-alpha mask-intersect mask-no-clip mask-no-repeat"
        style={{ maskImage: `url('${mask}')`, maskSize: "24px 24px", maskPosition: "-2px -2px", ...style }}
      >
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={src} />
      </div>
    </div>
  );
}

// ─── 107 Icon Exports ─────────────────────────────────────────────────────────

export const MArrowUp    = ({ className }: IconProps) => <MaskedIcon src={ASSETS.arrowUp}    className={className} />;
export const MArrowDown  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.arrowDown}  className={className} />;
export const MArrowLeft  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.arrowLeft}  className={className} />;
export const MArrowRight = ({ className }: IconProps) => <MaskedIcon src={ASSETS.arrowRight} className={className} />;
export const MClose      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.close}      className={className} />;
export const MCheck      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.check}      className={className} />;
export const MAdd        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.add}        className={className} />;
export const MMinus      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.minus}      className={className} />;
export const MRefresh    = ({ className }: IconProps) => <MaskedIcon src={ASSETS.refresh}    className={className} />;
export const MHelp       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.help}       className={className} />;

export const MWarning             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.warning}            className={className} />;
export const MWarningFill         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.warningFill}        className={className} />;
export const MCheckCircle         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.checkCircle}        className={className} />;
export const MCancel              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.cancel}             className={className} />;
export const MInfo                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.info}               className={className} />;
export const MInfo2               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.info2}              className={className} />;
export const MAlarm               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.alarm}              className={className} />;
export const MMap                 = ({ className }: IconProps) => <MaskedIcon src={ASSETS.map}                className={className} />;
export const MGroups              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.groups}             className={className} />;
export const MMyLocation          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.myLocation}         className={className} />;

export const MCarCrash            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.carCrash}           className={className} />;
export const MSecurity            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.security}           className={className} />;
export const MBadge               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.badge}              className={className} />;
export const MMedicalServices     = ({ className }: IconProps) => <MaskedIcon src={ASSETS.medicalServices}    className={className} />;
export const MDirectionsCar       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.directionsCar}      className={className} />;
export const MVisibility          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.visibility}         className={className} />;
export const MLocked              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.locked}             className={className} />;
export const MLockOpen            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.lockOpen}           className={className} />;
export const MFilterHdr           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.filterHdr}          className={className} />;

export const MGridOn              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.gridOn}             className={className} />;
export const MApartment           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.apartment}          className={className} />;
export const MLocalShipping       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.localShipping}      className={className} />;
export const MFolder              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.folder}             className={className} />;
export const MIdCard              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.idCard}             className={className} />;
export const MRocketLaunch        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.rocketLaunch}       className={className} />;
export const MBolt                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.bolt}               className={className} />;
export const MWaterDrop           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.waterDrop}          className={className} />;
export const MWc                  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.wc}                 className={className} />;
export const MPlayArrow           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.playArrow}          className={className} />;

export const MBluetooth           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.bluetooth}          className={className} />;
export const MNearMe              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.nearMe}             className={className} />;
export const MDevices             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.devices}            className={className} />;
export const MProgressActivity    = ({ className }: IconProps) => <MaskedIcon src={ASSETS.progressActivity}   className={className} />;
export const MCable               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.cable}              className={className} />;
export const MPartlyCloudyDay     = ({ className }: IconProps) => <MaskedIcon src={ASSETS.partlyCloudyDay}    className={className} />;
export const MDeskphone           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.deskphone}          className={className} />;
export const MDestruction         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.destruction}        className={className} />;
export const MRoad                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.road}               className={className} />;
export const MZonePersonUrgent    = ({ className }: IconProps) => <MaskedIcon src={ASSETS.zonePersonUrgent}   className={className} />;

export const MTimelapse           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.timelapse}          className={className} />;
export const MWaterBottleLarge    = ({ className }: IconProps) => <MaskedIcon src={ASSETS.waterBottleLarge}   className={className} />;
export const MHourglassTop        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.hourglassTop}       className={className} />;
export const MDarkMode            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.darkMode}           className={className} />;
export const MLightMode           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.lightMode}          className={className} />;
export const MBattery0Bar         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.battery0Bar}        className={className} />;
export const MBattery2Bar         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.battery2Bar}        className={className} />;
export const MBattery6Bar         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.battery6Bar}        className={className} />;
export const MBatteryFull         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.batteryFull}        className={className} />;
export const MLogout              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.logout}             className={className} />;

export const MLink                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.link}               className={className} />;
export const MLocationOn          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.locationOn}         className={className} />;
export const MLocalFireDepartment = ({ className }: IconProps) => <MaskedIcon src={ASSETS.localFireDepartment} className={className} />;
export const MQuestionMark        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.questionMark}       className={className} />;
export const MPause               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.pause}              className={className} />;
export const MLockClock           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.lockClock}          className={className} />;
export const MReplay10            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.replay10}           className={className} />;
export const MForward10           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.forward10}          className={className} />;
export const MNfc                 = ({ className }: IconProps) => <MaskedIcon src={ASSETS.nfc}                className={className} />;
export const MPassword            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.password}           className={className} />;

export const MSort                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.sort}               className={className} />;
export const MWatchVibration      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.watchVibration}     className={className} />;
export const MQrCodeScanner       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.qrCodeScanner}      className={className} />;
export const MKeep                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.keep}               className={className} />;
export const MDashboard           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.dashboard}          className={className} />;
export const MGroupAdd            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.groupAdd}           className={className} />;
export const MTrackChanges        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.trackChanges}       className={className} />;
export const MTabs                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.tabs}               className={className} />;
export const MPerson              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.person}             className={className} />;
export const MInsertChart         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.insertChart}        className={className} />;

export const MDownload            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.download}           className={className} />;
export const MDelete              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.delete}             className={className} />;
export const MEdit                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.edit}               className={className} />;
export const MTraffic             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.traffic}            className={className} />;
export const MStacks              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.stacks}             className={className} />;
export const MSave                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.save}               className={className} />;
export const MPhotoCamera         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.photoCamera}        className={className} />;
export const MBuild               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.build}              className={className} />;
export const MStars               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.stars}              className={className} />;
export const MSatelliteAlt        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.satelliteAlt}       className={className} />;

export const MSearch              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.search}             className={className} />;
export const MExplore             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.explore}            className={className} />;
export const MFormatListBulleted  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.formatListBulleted} className={className} />;
export const MModeHeatOff         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.modeHeatOff}        className={className} />;
export const MGrenade             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.grenade}            className={className} />;
export const MRotate              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.rotate}             className={className} />;
export const MCrop                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.crop}               className={className} />;
export const MLassoSelect         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.lassoSelect}        className={className} />;
export const MDirectionsWalk      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.directionsWalk}     className={className} />;
export const MFolderShared        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.folderShared}       className={className} />;
export const MCalendarToday       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.calendarToday}      className={className} />;

export const MMovedLocation       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.movedLocation}      className={className} />;
export const MPetSupplies         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.petSupplies}        className={className} />;
export const MFilterAlt           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.filterAlt}          className={className} />;
export const MMenu                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.menu}               className={className} />;
export const MHelpClinic          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.helpClinic}         className={className} />;
export const MLinesWide           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.linesWide}          className={className} />;
export const MEditSquare          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.editSquare}         className={className} />;
export const MDangerous           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.dangerous}          className={className} />;
export const MSettingsAccountBox  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.settingsAccountBox} className={className} />;
export const MSync                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.sync}               className={className} />;

export const MHome                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.home}               className={className} />;
export const MScreenShare         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.screenShare}        className={className} />;
export const MDirections          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.directions}         className={className} />;
export const MInstallDesktop      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.installDesktop}     className={className} />;
export const MRunningWithErrors   = ({ className }: IconProps) => <MaskedIcon src={ASSETS.runningWithErrors}  className={className} />;
export const MAirlineSeatFlat     = ({ className }: IconProps) => <MaskedIcon src={ASSETS.airlineSeatFlat}    className={className} />;
export const MSkull               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.skull}              className={className} />;
export const MMinkEraser          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.minkEraser}         className={className} />;
export const MFramePerson         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.framePerson}        className={className} />;
export const MAddPhotoAlternate   = ({ className }: IconProps) => <MaskedIcon src={ASSETS.addPhotoAlternate}  className={className} />;

export const MAccessibility       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.accessibility}      className={className} />;
export const MSentimentStressed   = ({ className }: IconProps) => <MaskedIcon src={ASSETS.sentimentStressed}  className={className} />;
export const MApparel             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.apparel}            className={className} />;
export const MBookmarkStar        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.bookmarkStar}       className={className} />;
export const MShare               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.share}              className={className} />;
export const MDistance            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.distance}           className={className} />;
export const MVerifiedUser        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.verifiedUser}       className={className} />;
export const MFlagCheck           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.flagCheck}          className={className} />;
export const MArrowsOutput        = ({ className }: IconProps) => <MaskedIcon src={ASSETS.arrowsOutput}       className={className} />;
export const MInventory           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.inventory}          className={className} />;

export const MError               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.error}              className={className} />;
export const MVisibilityOff       = ({ className }: IconProps) => <MaskedIcon src={ASSETS.visibilityOff}      className={className} />;
export const MWhereToVote         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.whereToVote}        className={className} />;
export const MNotificationsActive = ({ className }: IconProps) => <MaskedIcon src={ASSETS.notificationsActive} className={className} />;
export const MAssignment          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.assignment}         className={className} />;
export const MArchive             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.archive}            className={className} />;
export const MSend                = ({ className }: IconProps) => <MaskedIcon src={ASSETS.send}               className={className} />;
export const MGppBadAlt           = ({ className }: IconProps) => <MaskedIcon src={ASSETS.gppBadAlt}          className={className} />;

export const MImagesmode          = ({ className }: IconProps) => <MaskedIcon src={ASSETS.imagesmode}         className={className} />;
export const MGppBad              = ({ className }: IconProps) => <MaskedIcon src={ASSETS.gppBad}             className={className} />;
export const MPending             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.pending}            className={className} />;
export const MCamping             = ({ className }: IconProps) => <MaskedIcon src={ASSETS.camping}            className={className} />;
export const MFamilyRestroom      = ({ className }: IconProps) => <MaskedIcon src={ASSETS.familyRestroom}     className={className} />;
export const MHomeFill            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.homeFill}           className={className} />;
export const MMoreVert            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.moreVert}           className={className} />;
export const MNotReady            = ({ className }: IconProps) => <MaskedIcon src={ASSETS.notReady}           className={className} />;
export const MReady               = ({ className }: IconProps) => <MaskedIcon src={ASSETS.ready}              className={className} />;

export const MKeyboardDoubleArrowLeft  = ({ className }: IconProps) => <MaskedIcon src={ASSETS.keyboardDoubleArrowLeft}  className={className} />;
export const MKeyboardDoubleArrowRight = ({ className }: IconProps) => <MaskedIcon src={ASSETS.keyboardDoubleArrowRight} className={className} />;
export const MMail                     = ({ className }: IconProps) => <MaskedIcon src={ASSETS.mail}                     className={className} />;
export const MStarsAlt                 = ({ className }: IconProps) => <MaskedIcon src={ASSETS.starsAlt}                 className={className} />;
export const MSchedule                 = ({ className }: IconProps) => <MaskedIcon src={ASSETS.schedule}                 className={className} />;
export const MSettingsOutlined         = ({ className }: IconProps) => <MaskedIcon src={ASSETS.settingsOutlined}          className={className} />;
