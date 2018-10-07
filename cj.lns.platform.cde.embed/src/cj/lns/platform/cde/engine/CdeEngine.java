package cj.lns.platform.cde.engine;

import java.util.ArrayList;
import java.util.List;

import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;

import cj.lns.chip.sos.disk.INetDisk;
import cj.lns.chip.sos.disk.NetDisk;
import cj.lns.platform.cde.embed.auth.IHttpFetcher;
import cj.lns.platform.cde.embed.auth.IUserPortal;
import cj.lns.platform.cde.embed.contact.Contacts;
import cj.lns.platform.cde.embed.contact.IContacts;
import cj.lns.platform.cde.embed.service.ISosRssite;
import cj.studio.cde.site.ISiteSchema;
import cj.studio.cde.site.ISiteStore;
import cj.studio.cde.site.SiteSchema;
import cj.studio.cde.site.SiteStore;
import cj.studio.ecm.IServiceAfter;
import cj.studio.ecm.IServiceSite;
import cj.studio.ecm.annotation.CjService;
import cj.studio.ecm.annotation.CjServiceRef;

@CjService(name = "cdeEngine")
public class CdeEngine implements ICdeEngine, IServiceAfter {
	private MongoClient client;
	LRUCache<String, INetDisk> factories;
	private ISiteStore store;
	private ISiteSchema schema;
	@CjServiceRef(refByName="userPortal")
	private IUserPortal portal;
	@CjServiceRef(refByName="httpFetcher")
	private IHttpFetcher httpFetcher;
	private IContacts contacts;
	@CjServiceRef(refByName="sosrssite")
	private ISosRssite sosrssite;
	public IUserPortal portal() {
		return portal;
	}
	@Override
	public void onAfter(IServiceSite site) {
		factories = new LRUCache<>(4096);
		List<ServerAddress> seeds = new ArrayList<>();
		seeds.add(new ServerAddress(site.getProperty("netdisk.ip")));
		List<MongoCredential> credential = new ArrayList<>();
		MongoCredential m = MongoCredential.createCredential(site.getProperty("netdisk.user"), "test",
				site.getProperty("netdisk.pwd").toCharArray());
		credential.add(m);
		MongoClientOptions options = MongoClientOptions.builder().build();
		this.client = new MongoClient(seeds, credential, options);
		
		this.store=SiteStore.open(client, "$data.disk", "home");
		this.schema=SiteSchema.open(client, "$data.disk", "home");
		schema.refresh();
		this.contacts=Contacts.open(NetDisk.trustOpen(client, "$data.disk").home());
	}
	@Override
	public IHttpFetcher httpFetcher() {
		return httpFetcher;
	}
	@Override
	public INetDisk disk(String diskname) {
		if (factories.containsKey(diskname))
			return factories.get(diskname);
		INetDisk d=NetDisk.trustOpen(client, diskname);
		factories.put(diskname, d);
		return d;
	}

	@Override
	public ISiteStore store() {
		
		return store;
	}

	@Override
	public ISiteSchema schema() {
		
		return schema;
	}
	@Override
	public IContacts contacts() {
		return contacts;
	}
	@Override
	public ISosRssite sosrssite() {
		return sosrssite;
	}
}
