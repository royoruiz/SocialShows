import pymongo 
#from pymongo import *
from urllib2 import Request, urlopen
from datetime import datetime, date, time
from dateutil import tz
import json

# conexion = Connection()

conexion = pymongo.MongoClient()
db = conexion['socialshows']
c_tvshows = db['tvshows']

def max_id(cjto_shows):
	c_max = cjto_shows.find()
	
	showid_int_aux = 0
	showid_max = 0

	for show in c_max:
		if 'showid' in show:
			showid_int_aux = int(show['showid'])
		else:
			showid_int_aux = 0

		if showid_int_aux > showid_max:
			showid_max = showid_int_aux

	return showid_max

def trakt_with_tvrage_id(show, headers, show_db):
	#print show
	request_id_show = Request('https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'?extended=full', headers=headers)
	
	response_id_show = urlopen(request_id_show).read()
	data_id_show = json.loads(response_id_show)
	show_trakt = {}
	last_date = '1900-01-01T01:00:00.000Z'

	show_trakt['_id']					= show_db['_id']
	show_trakt['name'] 					= data_id_show['title']
	show_trakt['showid'] 				= show_db['showid']
	show_trakt['trakt']					= data_id_show['ids']['trakt']
	if 'showlink' in show_db:
		show_trakt['showlink'] 			= show_db['showlink']
	else:
		show_trakt['showlink']			= data_id_show['homepage']

	if data_id_show['first_aired'] is None:
		show_trakt['started'] 				= "2000/01/01"
	else:
		date_aired = datetime.strptime(str(data_id_show['first_aired']), "%Y-%m-%dT%H:%M:%S.%fZ")
		if date_aired.year < 1900:
			show_trakt['started'] = str(date_aired.year) + "/" + str(date_aired.month) + "/" + str(date_aired.day)
		else:	
			show_trakt['started'] 				= date_aired.strftime('%b/%d/%Y')
	
	if 'image' in show_db:
		show_trakt['image'] 				= show_db['image']
	show_trakt['origin_country'] 		= data_id_show['country']
	show_trakt['status'] 				= data_id_show['status']
	if 'classification' in show_db:
		show_trakt['classification'] 		= show_db['classification']
	show_trakt['genres'] 				= data_id_show['genres']
	show_trakt['runtime'] 				= data_id_show['runtime']
	network 							= {'country' : data_id_show['country'], 'network': data_id_show['network']}
	show_trakt['network']				= network
	show_trakt['airtime'] 				= data_id_show['airs']['time']
	show_trakt['airday'] 				= data_id_show['airs']['day']
	show_trakt['timezone'] 				= data_id_show['airs']['timezone']

	request_id_seasons = Request('https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'/seasons?extended=episodes', headers=headers)
	response_id_seasons = urlopen(request_id_seasons).read()
	data_id_seasons = json.loads(response_id_seasons)

	epnum = 0
	totalseasons = 0
	Episodelist_trakt = []
	#print 'https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'/seasons?extended=episodes'
	#print json.dumps(data_id_seasons, indent=4, sort_keys=False)

	for doc in data_id_seasons:
		#print "-----------------"
		if doc['number'] > 0:
			totalseasons = totalseasons + 1
			episode_trakt = []
			if 'episodes' in doc:
				for episode in doc['episodes']:
					#print 'https://api-v2launch.trakt.tv/shows/'+str(show['show']['ids']['trakt'])+'/seasons/' + str(episode['season']) + '/episodes/' + str(episode['number']) + '?extended=full'
					request_id_episodes = Request('https://api-v2launch.trakt.tv/shows/'+str(show['show']['ids']['trakt'])+'/seasons/' + str(episode['season']) + '/episodes/' + str(episode['number']) + '?extended=full', headers=headers)
					response_id_episodes = urlopen(request_id_episodes).read()
					data_id_episodes = json.loads(response_id_episodes)
					#print json.dumps(data_id_episodes, indent=4, sort_keys=True)			
					epnum = epnum + 1
					episode_trakt_item = {}
					episode_trakt_item['epnum'] 		= epnum
					#episode_trakt_item['seasonnum']		= str(data_id_episodes['number'])
					if data_id_episodes['number'] < 10:
						episode_trakt_item['seasonnum']		= '0' + str(data_id_episodes['number'])
					else:	
						episode_trakt_item['seasonnum']		= str(data_id_episodes['number'])
					episode_trakt_item['prodnum']		= None
					if data_id_episodes['first_aired'] is None:
						episode_trakt_item['airdate']		= "2016-00-00"
					else:
						date_aired = datetime.strptime(str(data_id_episodes['first_aired']), "%Y-%m-%dT%H:%M:%S.%fZ")
						if date_aired.year < 1900:
							episode_trakt_item['airdate'] = str(date_aired.year) + "/" + str(date_aired.month) + "/" + str(date_aired.day)
						else:
							from_zone = tz.gettz('UTC')
							to_zone = tz.gettz('America/New_York')	
							utc = date_aired.replace(tzinfo=from_zone)
							central = utc.astimezone(to_zone)
							episode_trakt_item['airdate']  				= central.strftime('%Y-%m-%d')	
							#episode_trakt_item['airdate'] 				= date_aired.strftime('%Y-%m-%d')
					episode_trakt_item['link']			= ""
					episode_trakt_item['screencap']		= ""
					episode_trakt_item['title']			= data_id_episodes['title']
					if show_trakt['status'] == 'ended' or show_trakt['status'] == 'canceled':
						last_date = data_id_episodes['first_aired']
					episode_trakt.append(episode_trakt_item)
					#print str(episode['number']) + str(episode['title'])

			Episodelist_trakt.append({'no': doc['number'], 'episode' : episode_trakt})
		#print json.dumps(doc, indent=4, sort_keys=True)
		#print "-----------------"

	if last_date is not None:
		last_aired = datetime.strptime(str(last_date), "%Y-%m-%dT%H:%M:%S.%fZ")
		show_trakt['ended'] 				= last_aired.strftime('%b/%d/%Y')
	show_trakt['Episodelist'] = Episodelist_trakt
	show_trakt['totalseasons'] = totalseasons
	if 'users' in show_db:
		show_trakt['users'] = show_db['users']
	else:
		show_trakt['users'] = []
	return show_trakt
	#print json.dumps(show_trakt, indent = 4, sort_keys=False)

def trakt_new_show(show, header, newid):
	request_id_show = Request('https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'?extended=full', headers=headers)
	
	response_id_show = urlopen(request_id_show).read()
	data_id_show = json.loads(response_id_show)
	show_trakt = {}
	last_date = '1900-01-01T01:00:00.000Z'


	show_trakt['name'] 					= data_id_show['title']
	show_trakt['showid'] 				= str(newid)
	show_trakt['trakt']					= data_id_show['ids']['trakt']
	show_trakt['showlink']	 			= data_id_show['homepage']
	if data_id_show['first_aired'] is None:
		show_trakt['started'] 				= "2000/01/01"
	else:
		date_aired = datetime.strptime(str(data_id_show['first_aired']), "%Y-%m-%dT%H:%M:%S.%fZ")
		if date_aired.year < 1900:
			show_trakt['started'] = str(date_aired.year) + "/" + str(date_aired.month) + "/" + str(date_aired.day)
		else:		
			show_trakt['started'] 				= date_aired.strftime('%b/%d/%Y')
	#show_trakt['ended'] 				= data_id_show['']
	#show_trakt['image'] 				= 
	show_trakt['origin_country'] 		= data_id_show['country']
	show_trakt['status'] 				= data_id_show['status']
	#show_trakt['classification'] 		= data_id_show['']
	show_trakt['genres'] 				= data_id_show['genres']
	show_trakt['runtime'] 				= data_id_show['runtime']
	network 							= {'country' : data_id_show['country'], 'network': data_id_show['network']}
	show_trakt['network']				= network
	show_trakt['airtime'] 				= data_id_show['airs']['time']
	show_trakt['airday'] 				= data_id_show['airs']['day']
	show_trakt['timezone'] 				= data_id_show['airs']['timezone']

	request_id_seasons = Request('https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'/seasons?extended=episodes', headers=headers)
	response_id_seasons = urlopen(request_id_seasons).read()
	data_id_seasons = json.loads(response_id_seasons)

	epnum = 0
	totalseasons = 0
	Episodelist_trakt = []
	
	#print 'https://api-v2launch.trakt.tv/shows/'+ str(show['show']['ids']['trakt']) +'/seasons?extended=episodes'
	#print json.dumps(data_id_seasons, indent=4, sort_keys=False)

	for doc in data_id_seasons:
		#print "-----------------"
		if doc['number'] > 0:
			totalseasons = totalseasons + 1
			episode_trakt = []
			if 'episodes' in doc:
				for episode in doc['episodes']:
					#print 'https://api-v2launch.trakt.tv/shows/'+str(show['show']['ids']['trakt'])+'/seasons/' + str(episode['season']) + '/episodes/' + str(episode['number']) + '?extended=full'
					request_id_episodes = Request('https://api-v2launch.trakt.tv/shows/'+str(show['show']['ids']['trakt'])+'/seasons/' + str(episode['season']) + '/episodes/' + str(episode['number']) + '?extended=full', headers=headers)
					response_id_episodes = urlopen(request_id_episodes).read()
					data_id_episodes = json.loads(response_id_episodes)
					#print json.dumps(data_id_episodes, indent=4, sort_keys=True)			
					epnum = epnum + 1
					episode_trakt_item = {}
					episode_trakt_item['epnum'] 		= epnum
					if data_id_episodes['number'] < 10:
						episode_trakt_item['seasonnum']		= '0' + str(data_id_episodes['number'])
					else:	
						episode_trakt_item['seasonnum']		= str(data_id_episodes['number'])
					episode_trakt_item['prodnum']		= None
					if data_id_episodes['first_aired'] is None:
						episode_trakt_item['airdate']		= "2016-00-00"
					else:
						date_aired = datetime.strptime(str(data_id_episodes['first_aired']), "%Y-%m-%dT%H:%M:%S.%fZ")
						if date_aired.year < 1900:
							episode_trakt_item['airdate'] = str(date_aired.year) + "-" + str(date_aired.month) + "-" + str(date_aired.day)
						else:
							from_zone = tz.gettz('UTC')
							to_zone = tz.gettz('America/New_York')	
							utc = date_aired.replace(tzinfo=from_zone)
							central = utc.astimezone(to_zone)
							episode_trakt_item['airdate'] 				= central.strftime('%Y-%m-%d')
							#episode_trakt_item['airdate'] 				= date_aired.strftime('%Y-%m-%d')
						
					episode_trakt_item['link']			= ""
					episode_trakt_item['screencap']		= ""
					episode_trakt_item['title']			= data_id_episodes['title']
					if show_trakt['status'] == 'ended' or show_trakt['status'] == 'canceled':
						if data_id_episodes['first_aired'] is not None:
							last_date = data_id_episodes['first_aired']
					episode_trakt.append(episode_trakt_item)
					#print str(episode['number']) + str(episode['title'])

			Episodelist_trakt.append({'no': doc['number'], 'episode' : episode_trakt})
		#print json.dumps(doc, indent=4, sort_keys=True)
		#print "-----------------"

	last_aired = datetime.strptime(str(last_date), "%Y-%m-%dT%H:%M:%S.%fZ")
	show_trakt['ended'] 				= last_aired.strftime('%b/%d/%Y')
	show_trakt['Episodelist'] = Episodelist_trakt
	show_trakt['totalseasons'] = totalseasons
	show_trakt['users'] = []
	#print json.dumps(show_trakt, indent = 4, sort_keys=False)
	return show_trakt


show_max_id = max_id (c_tvshows)
print show_max_id 


headers = {
  'Content-Type': 'application/json',
  'trakt-api-version': '2',
  'trakt-api-key': 'my_key'
}
request = Request('https://api-v2launch.trakt.tv/shows/updates/2015-10-22?page=1&limit=1000000', headers=headers)
#request = Request('https://api-v2launch.trakt.tv/shows/updates/2015-09-21', headers=headers)

response_body = urlopen(request).read()
data = json.loads(response_body)
print len(data)


count = 0
count_tvrage_id = 0
count_tvrage = 0
count_tvrage_not_found = 0
for doc in data:
	count = count + 1
	#print str(doc['show']['ids']['tvrage']) 
	if str(doc['show']['ids']['tvrage']) == "None":
		c_query = c_tvshows.find({"name": { "$regex": doc['show']['title'].encode('ascii', 'ignore').decode('ascii'), "$options": '-i'}})
		if c_query.count() == 0:
			print str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'A'
			show_max_id = show_max_id + 1
			
			show_n = trakt_new_show (doc, headers, show_max_id)

			c_tvshows.save(show_n)

			count_tvrage_not_found = count_tvrage_not_found + 1
		else:
			#print str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + str(c_query.count())
			if c_query.count() > 1:
				c_query = c_tvshows.find({"name": doc['show']['title'].encode('ascii', 'ignore').decode('ascii')})
				if c_query.count() == 0:
					#como si fuera nuevo, no?
					print str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'A2'
					show_max_id = show_max_id + 1
			
					show_n = trakt_new_show (doc, headers, show_max_id)

					c_tvshows.save(show_n)

					count_tvrage_not_found = count_tvrage_not_found + 1
				else:
					if c_query.count() > 1:	
						print '**********************************'
						print '******* error db *****************'
						print str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + str(c_query.count())
						print '**********************************'
					else:
						if 'users' in c_query[0]:
							if len(c_query[0]['users']) > 0:
								show_n = trakt_with_tvrage_id(doc, headers, c_query[0])
								c_tvshows.save(show_n)
								print ' ' + str(count) + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B2'
							else:
								print 'NO se actualiza ' + ' ' + str(count) + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B2'
						else:
							print 'NO se actualiza ' + str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B2'
						#print c_query[0]

			else:
				if 'users' in c_query[0]:
					if len(c_query[0]['users']) > 0:
						show_n = trakt_with_tvrage_id(doc, headers, c_query[0])
						c_tvshows.save(show_n)
						print str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B'
					else:
						print 'NO se actualiza ' + str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B'
				else:
					print 'NO se actualiza ' + str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'B'
				#print c_query[0]

			count_tvrage = count_tvrage + 1
	else:
		c_query = c_tvshows.find_one({"showid": str(doc['show']['ids']['tvrage'])})
		#print c_query
		if 'users' in c_query:
			if len(c_query['users']) > 0:
				show_n = trakt_with_tvrage_id(doc, headers, c_query)
				c_tvshows.save(show_n)
				print str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'C'
			else: 
				print 'NO se actualiza '  + str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'C'
		else:
			print 'NO se actualiza '  + str(count) + ' ' + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) + ' ' + 'C'
		count_tvrage_id = count_tvrage_id + 1

print count
print count_tvrage_id
print count_tvrage
print count_tvrage_not_found
	#print str(doc['show']['ids']['trakt'])  + " " + str(count) + " " + str(doc['show']['title'].encode('ascii', 'ignore').decode('ascii')) 







