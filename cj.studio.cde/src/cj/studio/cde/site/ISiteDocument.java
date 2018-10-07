package cj.studio.cde.site;

import java.util.Map;

//索引统一用name而非display
public interface ISiteDocument {
	String docid();
	//path是计算得来，不存储
	PathParser path();

	Map<String, Object> parallels();// 例：品牌（style)=联想(lianxiang),用途(usage)=办公(bangong)，故而：key=value即：{style=lianxiang,usage=bangong}

	Object document();
	long ctime();
	String creator();
	void creator(String creator);
	long utime();
	Indicator indicator();
	long ltime();
	long weight();
}
