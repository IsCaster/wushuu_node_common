//deprecated
var table_ope = require('./pgsql.db.dao.js').table_operator
var sync = require('./pgsql.db.config.js')._sync
sync(function(){

	var goodsOp=table_ope("Goods")
	var testgoods={}
	testgoods.name="xiaoxiao"

	goodsOp.add(testgoods,function (a){
		if (a == 0)
			console.log ('false')
		else
			console.log ('success')
	})

	goodsOp.find({name:"xiaoxiao"},function (status,result){
		if (status == 0)
			console.log ('false')
		else
			console.log(result)
		console.log ('success')
	})
	var apOp=table_ope("Ap")
	var testap={}
	testap.mac="aa-bb-cc-dd-ee-ff"
	apOp.add(testap,function (a){
		if (a == 0)
			console.log ('false')
		else
			console.log ('success')
	})
})

	


	//condition example: {goods_name:"xiaoxiao"}
/*id :{type:'serial',key:true},
		name:String,						//商品名
		owner:{type:'integer',size:4},		//商户id
		imageUrl:String,					//图片地址
		available_number:{type:'integer',size:4},//库存
		sales_number:{type:'number',size:4},//已出售的数量
		price_origin:{type:'number',size:4},//原价
		price_true:{type:'integer',size:4},	//现价
		category:{type:'integer',size:4},	//商品类型
		notice:String,						//提示信息
		buy_detail:String,					//购买详情
		introduction:String,				//描述
		isReturnAnytime:Boolean,			//是否支持随时退货*/
