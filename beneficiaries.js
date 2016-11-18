{ 
  suicides: 0,
  beneficiaries : [],
  result: function() { return this.beneficiaries },
  step: function(log, db){
      if( log.op == 'SUICIDE'){
        this.beneficiaries.push("0x"+log.stack.peek(0).Text(16))
      }
  },
}