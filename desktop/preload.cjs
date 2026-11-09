const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('spreadmaster',{readPaste:id=>ipcRenderer.invoke('pokepaste:read',id)});
