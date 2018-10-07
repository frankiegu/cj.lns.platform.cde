package cj.lns.platform.cde.website.service;

import cj.studio.ecm.annotation.CjService;

@CjService(name="printEcho")
public class PrintEcho {
	public void printEcho(String text){
		System.out.println("演示jss调用java服务："+text);
	}
}
