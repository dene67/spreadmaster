const {app,BrowserWindow,shell,ipcMain}=require('electron');
const path=require('node:path');
app.setName('SPREADMASTER');
app.whenReady().then(()=>{const win=new BrowserWindow({width:1500,height:1000,minWidth:850,minHeight:650,backgroundColor:'#181a1e',autoHideMenuBar:true,title:'SPREADMASTER',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});ipcMain.handle('pokepaste:read',(event,id)=>{if(event.sender!==win.webContents)throw Error('Unknown window');return require('../scripts/pokepaste.cjs').readPaste(id);});win.loadFile(path.join(__dirname,'../dist/index.html'));win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))shell.openExternal(url);return {action:'deny'};});win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file://'))event.preventDefault();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
