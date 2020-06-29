class PlasterSafe{

    constructor(){
        this.plasters = {};
    }
    
    itemCallback(action, item){
        if(!this.plasters[item.id]){
            this.plasters[item.id] = {};
        }
        let plaster = this.plasters[item.id];
        let payload = item.Payload;
        switch(action){
            case "status":
                if(payload.value=='start'){
                    if(plaster[payload.ts]==null){
                        plaster[payload.ts] = 0;
                    }
                }
                else if(payload.value == 'stop'){
                    plaster[payload.started] = payload.ts;
                }
                break;
            case "temp":
            case "acc":
            case "sma":
            case "err":
                plaster[payload.ts] = payload.value;
                break;
            case "thresh":
                plaster[payload.ts] = {};
                Object.keys(payload).forEach(key => {
                    if(key!="id" && key!="ts"){
                        plaster[payload.ts][key] = payload[key];
                    }
                });
            default:
                console.log("action not recognized");
                break;
        }
    }
    
    getPlasters(){
        return this.plasters;
    }
}

module.exports = PlasterSafe.bind(this);