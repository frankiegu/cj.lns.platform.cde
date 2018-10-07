package cj.lns.platform.cde.rssite;

import cj.studio.ecm.graph.CjStatusDef;
import cj.studio.ecm.graph.IConstans;

public interface IHttpFetcherProtocol extends IConstans{
	@CjStatusDef(message = "hfc/1.0")
	String PROTOCAL = "protocol";
}
