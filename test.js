const manifestManager  = new ManifestManager();
const projectLoader  = new ProjectLoader();
const uiServices = new UIServices();


activationSequence(manifestManager, projectLoader, uiServices)
.subscribe((a,b,c)=>{

});
