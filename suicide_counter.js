{ 
  "suicides": 0,

  "lastOp":{},
  "result": function() { return this.suicides  },
  "step": function(log, db){
      if( log.op == 'SUICIDE'){
        this.suicides++;
      }
  },
}