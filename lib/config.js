var pg_conf = {
	'host': 'WUSHUU-PG',
	'port': 5432,
	'user': 'wushuu',
	'pass': 'woyoadmin',
	'db': 'adsweb'
}
var pg_conn_str = "postgres://" + pg_conf.user + ":" + pg_conf.pass + "@" + pg_conf.host + "/" + pg_conf.db;

module.exports = {
	SSID_CHANNEL: 6,
	AWIFI_SSID_CHANNEL: 5,
	SERVER_NAME: "test_server",
	CENSOR_SERVER: "115.28.9.186",
	CENSOR_PORT: 8855,
	TRIGGER_TIME_GAP: 10,
	//PHP_PORTAL_TYPE:'folder_copy/sub_db'
	PHP_PORTAL_TYPE: 'folder_copy',
	pg_conf: pg_conf,
	pg_conn_str: pg_conn_str,
	app_port: {
		store: 8000,
		mall: 8001
	},
	mysql_location: 'http://WUSHUU-SERVER:18080/wushuu/ads'

}