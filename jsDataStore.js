// JavaScript Document

/***
 * Ajaxified Record Navigator
 * author: Samuel Ugiagbe Agbonkpolo (samuelagm@gmail.com);
 * version: 2.0
 * Description: merges data from different datasources into one datasource
 * Dependencies: jQuery, JsRender
 **/
 
var rcdSrvc = window.rcdSrvc || {};

(function () {
	
	'use strict';
	
	window.shortlist = [];
	
	
	var author = 'Samuel Agbonkpolo (samuelagm@gmail.com)',
		version ='2.0',
		
		config = {
			pageLength:10
		},
		
		utils = {
			
			pageindex : function (recordindex) {
				var pagelength = config.pageLength;
				return { index:Math.floor( recordindex/pagelength ) * pagelength, offset:(recordindex % pagelength) };
			}
			
		},
		
		page = function (index, data, isLast, length){
			
			this.data = data;
			this.isLast = isLast;
			this.length = length;
			this.index = index;
						
		},
		
		dataStore = {
			
			currentpage : 0,
			datasource : [],
			v:[],
			
			
			firstpage : function () {
				
				var index = 0,
					datasource = this.datasource,
					length = config.pageLength,
					data = datasource.slice(index, (index + length) ),
					last = (index >= (datasource.length - length) ) ? true : false;

				this.currentpage = index;
								
				return ( new page(index, data, last, length) );
				
			},

			lastpage : function () {
				
				var datasource = this.datasource,
					length = config.pageLength,
					index = datasource.length - length,
					data = datasource.slice(index, (index + length) );

				this.currentpage = index; //updates datastore page index
					
				return ( new page(index, data, true, length) );
				
			},
						
			nextpage : function () {
				
				var datasource = this.datasource,
					length = config.pageLength,
					index = this.currentpage + length, //look ahead
					data = [],
					last = false;
					
				if(index >= (datasource.length - length)   ){
					
					
					
					index = (datasource.length - length);
					
					if(index <= 0 )
						index = 0;
						
					data = datasource.slice(index, (index + length) );
					last = (index >= (datasource.length - length) ) ? true : false;
					
				}else{
					
					data = datasource.slice(index, (index + length) );
					last = (index >= (datasource.length - length) ) ? true : false;
				}
										
				this.currentpage = index; //updates datastore page index
					
				return ( new page(index, data, last, length) );
				
			},
			
			prevpage : function () {
				
				var datasource = this.datasource,
					length = config.pageLength,
					index = this.currentpage - length,
					data = [],
					last = false;
				
				if(index <= 0){
					
					index = 0;
					data = datasource.slice(index, (index + length) );
					last = (index >= (datasource.length - length) ) ? true : false;
					
				}else{
					
					data = datasource.slice(index, (index + length) );
					last = (index >= (datasource.length - length) ) ? true : false;
				}
										
				this.currentpage = index; //updates datastore page index
					
				return ( new page(index, data, last, length) );
				
			},
						
			getrecord : function(term, field){
				
				var j,
					u = utils,
					index = 0,
					offset = 0,
					data = {},
					last = false,
					length = config.pageLength,
					datasource = this.datasource;
					
				if(field === 'computer_no'){
					
					for(j = datasource.length; j -= 1 ;){
						
						if(datasource[j]['computer_no'] === term){
							
							index = u.pageindex(j).index;
							offset = u.pageindex(j).offset;
							data = datasource.slice(index, (index + length) );
							last = (index >= datasource.length ) ? true : false;
							
							
							data[offset].prop.highlight = true;
							this.currentpage = index; //updates datastore page index
														
							return new page(index, data[offset], last, length);
							
						}
						
					}
					
				} else {
					
					for(j = datasource.length; j --  ;){
						console.dir(datasource[j]);
						if(datasource[j][field] === term){
							
							index = u.pageindex(j).index;
							offset = u.pageindex(j).offset;
							data = datasource.slice(index, (index + length) );
							last = (index >= datasource.length ) ? true : false;
							
							data[offset].prop.highlight = true;
							this.currentpage = index; //updates datastore page index
							
							return new page(index, data[offset], last, length);
							
						}
						
					}
					
				}
				
				
			}
		},
		
		com = {
			
			files : [],
			dbdata : [],
			//date : new Date(),
			
			load : function () {

				paint.paintloading();				
				$.getJSON('../server/payroll.php', {payrolls : 1, month:this.date.getMonth()+1, year:this.date.getFullYear()}, com.loadfiles);
				
			},
			
			loadfiles : function (dbdata) {
				window.ndata = dbdata;

				com.dbdata = dbdata;
				dataStore.datasources = dbdata;
				//dataStore.changesource();
				//$.get('db.php', {files : 1}, com.process, 'json');
				
			}

		},

		
		navigation = {
			
			bindcontrols : function () {
				
				$("#next, #prev, #home").unbind();
				
				$("#home ,#prev, #next").click(function(ev) {
					
					var page = {};
					
					switch(ev.target.id){
						case "next":
							page = dataStore.nextpage();
							break;
						case "prev":
							page = dataStore.prevpage();
							break;
						case "home":
							page = dataStore.firstpage();
							break;
						default:
							page = dataStore.firstpage();
							break;
					}
				
					
					
				});
				
				$("#searchbtn").click(function(ev){
					var page = {};
	
					if($("#searchbox").val().length === 0){
						return false;
					}
			
					//$("#viewall").show()
					
					
					page = dataStore.getrecord($("#searchbox").val(), 'name');
					
					if(page !== undefined){
						
						//paint.paintdata(page.data);
						navigation.enablebtn("#next");
						navigation.enablebtn("#prev");
						
					}else {
						alert('cant find: '+ $("#searchbox").val() );						
					}
					
					
					
				});


			},
			
			disablebtn : function(nav_id) {
				$(nav_id).removeClass('button').addClass('disabled')
			},
			
			enablebtn : function(nav_id) {
				$(nav_id).removeClass('disabled').addClass('button');	
			}

		};
		
		//(function init(){
			//com.load();
			//navigation.bindcontrols();
		//})();
		
		//return ({author:author, version:version});
		rcdSrvc.author = author;
		rcdSrvc.version = version;
})();
