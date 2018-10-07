/*
 * 创建：2016.0829
 * 作者：赵向彬
 * 说明：
 * <![jss:{
		scope:'runtime',
		extends:'cj.lns.platform.cde.website.pages.ICatsitePrinter',
		isStronglyJss:true,
		filter:{
	 	}
 	},
 	services:{
 		menu:"menuService",
 		cdeEngine:'cdeEngine'
 	}
 ]>
*/

var FormData = Java.type('cj.studio.ecm.frame.FormData');
var String = Java.type('java.lang.String');
var WebUtil = Java.type('cj.studio.ecm.net.web.WebUtil');
var Document = Java.type('org.jsoup.nodes.Document');
var File = Java.type('java.io.File');
var ArrayList = Java.type('java.util.ArrayList');
var FileHelper = Java.type('cj.ultimate.util.FileHelper');
var Gson = Java.type('cj.ultimate.gson2.com.google.gson.Gson');
var CdeSubject = Java.type('cj.lns.platform.cde.embed.auth.CdeSubject');
var ISubject = Java.type('cj.lns.chip.sos.website.framework.ISubject');
var HashMap=Java.type('java.util.HashMap');
var System=Java.type('java.lang.System');
var TupleDocument=Java.type('cj.lns.chip.sos.cube.framework.TupleDocument');
var StringUtil=Java.type('cj.ultimate.util.StringUtil');
var CircuitException = Java.type('cj.studio.ecm.graph.CircuitException');
var Comparator = Java.type('java.util.Comparator');
var Collections = Java.type('java.util.Collections');

exports.getHtml = function(site,ctx) {
	var doc = ctx.html("/views/categorysite.html", "utf-8");
	var engine = imports.head.services.cdeEngine;
	var schema=engine.schema();
	doc.select('#category-site').attr('site',site.name);
	printPrimaries(site,schema,doc);
	return doc;
}
function printPrimaries(site,schema,doc){
	var primaries=schema.listPrimaries(site.name);
	var tempList=new ArrayList();
	tempList.addAll(primaries);
	primaries= tempList;
	Collections.sort(primaries, new Comparator(){
		 compare:function(o1,o2) {
			return o1.getSort()>o2.getSort()?1:-1;
		}
	});
	var it=primaries.iterator();
	var ul=doc.select('#category-site > .category-left .primaries').first();
	var ali=ul.select('>li').first().clone();
	ul.empty();
	var subitems=doc.select('#siteworkbin .subitems').first();
	var siteworkbin=doc.select('#siteworkbin');
	siteworkbin.empty();
	while(it.hasNext()){
		var p=it.next();
		var li=ali.clone();
		li.attr('primary',p.name);
		
		var span=li.select('>span');
		var hrefs=span.select('a');
		var ahref=hrefs.first().clone();
		span.empty();
		//一级分类
		var catp=ahref.clone();
		catp.attr('href',String.format('/path/%s/%s',site.name,p.name));
		catp.attr('dpath',String.format('%s://%s',site.display,p.display));
		catp.attr('target',p.target);
		catp.attr('cat-level','1');
		if(p.tips!=''&&typeof p.tips!='undefined'){
			catp.attr('title',p.tips);
		}
		catp.html(p.display);
		span.append(catp);
		span.append('：');
		
		var secondaries=p.getSecondaries();
//		print(p.name+' '+secondaries.size());
		var secit=secondaries.values().iterator();
		if(secondaries.size()>0){
			span.append('|');
		}
		var items=subitems.clone();
		items.attr('primary',p.name);
		var aitem=items.select('dl').first().clone();
		items.empty();
		while(secit.hasNext()){
			var sec=secit.next();
			var href=ahref.clone();
			if(sec.tips!=''&&typeof sec.tips!='undefined'){
				href.attr('title',sec.tips);
			}
			var sechref=String.format('/path/%s/%s/%s',site.name,p.name,sec.name);
			href.attr('href',sechref);
			href.attr('target',sec.target);
			var secdpath=String.format('%s://%s/%s',site.display,p.display,sec.display);
			href.attr('dpath',secdpath);
			href.attr('cat-level','2');
			href.html(sec.pdisplay);
			span.append(href);
			span.append('|');
			
			//打印第二级
			var item=aitem.clone();
			var dta=item.select('dt a');
			dta.attr('href',sechref);
			dta.attr('dpath',secdpath);
			dta.attr('cat-level','2');
			dta.attr('target',sec.target);
			dta.html(sec.display);
			
			//三级分类
			var terts=sec.getTertiaries();
			var tertit=terts.values().iterator();
			var dd=item.select('dd').first();
			var addhref=dd.select('a').first().clone();
			dd.empty();
			while(tertit.hasNext()){
				var tert=tertit.next();
				var ddhref=addhref.clone();
				ddhref.attr('href',String.format('/path/%s/%s/%s/%s',site.name,p.name,sec.name,tert.name));
				ddhref.attr('dpath',String.format('%s://%s/%s/%s',site.display,p.display,sec.display,tert.display));
				ddhref.attr('target',tert.target);
				ddhref.html(tert.display);
				ddhref.attr('cat-level','3');
				if(typeof tert.tips!='undefined'&&tert.tips!=null){
					ddhref.attr('title',tert.tips);
				}
				dd.append(ddhref);
			}
			
			items.append(item);
		}
		siteworkbin.append(items);
		ul.append(li);
	}
}