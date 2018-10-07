package cj.lns.platform.cde.rssite;

import cj.studio.ecm.graph.AnnotationProtocolFactory;
import cj.studio.ecm.graph.GraphCreator;
import cj.studio.ecm.graph.IProtocolFactory;
import cj.studio.ecm.graph.ISink;

class HttpFetcherCreator extends GraphCreator {
		@Override
		protected IProtocolFactory newProtocol() {
			return AnnotationProtocolFactory.factory(IHttpFetcherProtocol.class);
		}

		@Override
		protected ISink createSink(String sink) {
			if(sink.equals("dispatcher")){
				return new DispatcherSink();
			}
			if(sink.equals("httpGetter")){
				return new HttpGetSink();
			}
			return null;
		}
	}