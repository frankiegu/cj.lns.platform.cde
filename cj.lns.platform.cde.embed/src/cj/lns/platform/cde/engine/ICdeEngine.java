package cj.lns.platform.cde.engine;

import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.platform.cde.embed.auth.IHttpFetcher;
import cj.lns.platform.cde.embed.auth.IUserPortal;
import cj.lns.platform.cde.embed.contact.IContacts;
import cj.lns.platform.cde.embed.service.ISosRssite;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.site.ISiteStore;

public interface ICdeEngine {
	INetDisk disk(String diskname);
	ISiteStore store();
	ISiteSchema schema();
	IUserPortal portal();
	IContacts contacts();
	IHttpFetcher httpFetcher();
	ISosRssite sosrssite();
}
