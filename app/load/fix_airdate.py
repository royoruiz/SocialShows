import pymongo 

conexion = pymongo.MongoClient()
db = conexion['socialshows']
c_tvshows = db['tvshows']


resultado = c_tvshows.aggregate([{ '$match': {'$and': [{ 'Episodelist.episode': { '$exists': 'true' } }, {'Episodelist.episode.airdate': {'$eq': "2016-00-00"}}]}},
        {'$unwind': '$Episodelist'},
        {'$project': {'_id': 0, 'show_id': '$_id', 'show': '$showid','airtime': '$airtime', 'season': '$Episodelist.no', 'elapsed': '$runtime', 'episode':'$Episodelist.episode', 'name': '$name'}},
        {'$unwind': '$episode'},
        {'$match': {'episode.airdate': {'$eq': "2016-00-00"}}}]);

i = 0
#print resultado.len()

for doc in resultado:
	i = i + 1
	single = c_tvshows.find_one({'_id': doc['show_id']})
	#print "actualizado el " + str(i) + ' ' + str(doc['show_id'])
	print doc['season']
	print doc['episode']['seasonnum']
	for season in single['Episodelist']:
		for episode in season['episode']:
			if episode['airdate'] == "2016-00-00":
				episode['airdate'] = "2099-01-01"


	#single['Episodelist'][int(doc['season'])-1]['episode'][int(doc['episode']['seasonnum'])-1]['airdate'] = "2016-01-01"
	c_tvshows.save(single)


