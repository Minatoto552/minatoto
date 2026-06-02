const fs = require('fs');
const path = require('path');

const pathMap = {
  'App.tsx': '',
  'main.tsx': '',
  'index.css': '',
  'firebase.ts': 'lib',
  'utils.ts': 'lib',
  'MockAppContext.tsx': 'lib',
  'MockAppProvider.tsx': 'lib',
  'TableCard.tsx': 'components/ui',
  'RotationLabel.tsx': 'components/ui',
  'EmergencyCallNotification.tsx': 'components/ui',
  'EmergencyHelpButton.tsx': 'components/ui',
  'TableNumberLabel.tsx': 'components/ui',
  'RotationTab.tsx': 'components/ui',
  'OpeningDoor.tsx': 'components/opening',
  'AppLayout.tsx': 'components/layout',
  'CustomerLayout.tsx': 'components/layout',
  'ProtectedRoute.tsx': 'components/auth',
  'ErrorBoundary.tsx': 'components',
  
  // pages
  'LandingPage.tsx': 'pages/customer',
  'DashboardHome.tsx': 'pages/customer',
  'OrderPage.tsx': 'pages/customer',
  'PublicPlacementView.tsx': 'pages/customer',
  'RecipeListPage.tsx': 'pages/customer',
  'AnnouncementsPage.tsx': 'pages/customer',
  'GuestHomePage.tsx': 'pages/customer',
  'GuestCastsPage.tsx': 'pages/customer',
  'GuestMenuPage.tsx': 'pages/customer',
  'GuestLotteryPage.tsx': 'pages/customer',
  'GuestPointPage.tsx': 'pages/customer',
  'GuestGamePage.tsx': 'pages/customer',
  
  'DashboardPage.tsx': 'pages/staff',
  'AttendanceRequestPage.tsx': 'pages/staff',
  
  'AdminPage.tsx': 'pages/admin',
  'DataMaintenancePage.tsx': 'pages/admin',
  'MemberManagerPage.tsx': 'pages/admin',
  'MenuEditorPage.tsx': 'pages/admin',
  'RotationManagerPage.tsx': 'pages/admin',
  'StaffTaskManagerPage.tsx': 'pages/admin',
  'AnnouncementManagerPage.tsx': 'pages/admin',
  'TimedAnnouncementManagerPage.tsx': 'pages/admin',
  'UserManagerPage.tsx': 'pages/admin',
  'EmergencyCallHistoryPage.tsx': 'pages/admin',
  'LotteryManagerPage.tsx': 'pages/admin',
  'AttendanceManagerPage.tsx': 'pages/admin',
  
  'LoginPage.tsx': 'pages/auth',
  'RegisterPage.tsx': 'pages/auth',
  'OpeningAnimation.tsx': 'pages/auth',
  'PendingPage.tsx': 'pages/auth',
  'RejectedPage.tsx': 'pages/auth',
  'DeletedPage.tsx': 'pages/auth',
  'ProfilePage.tsx': 'pages/auth',
  'GuestLoginPage.tsx': 'pages/auth',
  'GuestRegisterPage.tsx': 'pages/auth',
  'OpeningLogo.tsx': 'pages/auth',
  'OpeningAnimation (1).tsx': 'pages/auth',

  'useDraggableScroll.ts': 'hooks',
};

const srcDir = path.join(process.cwd(), 'src');
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);

const files = fs.readdirSync(process.cwd());

for (const file of files) {
  if (file in pathMap) {
    const targetDir = path.join(srcDir, pathMap[file]);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.renameSync(file, path.join(targetDir, file));
    console.log(`Moved ${file} to src/${pathMap[file]}`);
  }
}

// Update index.html
const indexHtmlPath = 'index.html';
if (fs.existsSync(indexHtmlPath)) {
  let content = fs.readFileSync(indexHtmlPath, 'utf8');
  content = content.replace('src="/main.tsx"', 'src="/src/main.tsx"');
  fs.writeFileSync(indexHtmlPath, content);
  console.log("Updated index.html to point to /src/main.tsx");
}
