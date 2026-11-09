exports.readPaste=async function(id){
 if(!/^[a-f0-9]{16}$/.test(id))throw Error('Invalid Poképaste ID');
 const response=await fetch(`https://pokepast.es/${id}/json`,{signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!response.ok)throw Error('Poképaste returned '+response.status);
 const text=await response.text();if(text.length>100000)throw Error('Paste is too large');
 const data=JSON.parse(text);if(typeof data.paste!=='string'||data.paste.length>80000)throw Error('Invalid paste content');
 return {paste:data.paste,title:typeof data.title==='string'?data.title:''};
};
