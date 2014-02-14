from pymongo import *
import urllib2
import urllib
import xmltodict
import json

print "Conectando al Servidor de Base de Datos Local..."
conexion = Connection() # Conexion local por defecto

#creando/obteniendo un objeto que referencie a la base de datos.
db = conexion['socialshows-dev'] #base de datos a usar

print "Establecida a la BBDD"
print "Recuperando la tabla de control"
response = urllib2.urlopen('http://services.tvrage.com/feeds/show_list.php')

xml=response.read()

res = xmltodict.parse(xml)

c_control = db['control']

print "Borrando la tabla de control"
c_control.remove()

print "Salvando la descarga"
c_control.save(res)

print "Seleccionando la tabla de control"
cursor = c_control.aggregate([{'$unwind': '$shows.show'},{'$project':{'_id':0, 'show_id': '$shows.show.id', 'name': '$shows.show.name', 'country': '$shows.show.country', 'status': '$shows.show.status'}}])

print "Borrado del documento unico"
c_control.remove()

print "Salvando documento a documento los shows"
for doc in cursor['result']:
	c_control.save(doc)

print "Comenzamos la actualizacion de las series"
c_control = db['control']
c_tvshows = db['tvshows']

c_update = c_control.find()

for doc in c_update:
	c_query = c_tvshows.find({"showid": doc['show_id']})

	if c_query.count() == 0:
			#print "Aqui actualizamos todo"
			response = urllib2.urlopen('http://services.tvrage.com/feeds/full_show_info.php?sid=' + doc['show_id'])

			xml=response.read()

			res = xmltodict.parse(xml)

			try:
				val = res['Show']['Episodelist']['Season']
			except KeyError:
				val = []

			res['Show']['Episodelist'] = []

			if isinstance(val, (list, tuple)):
				val_array = val
			else:
				val_array = [val]

			for season in val_array:
				if isinstance(season['episode'], (list, tuple)):
					pass
				else:
					aux = [season['episode']]
					season['episode'] = aux

			res['Show']['Episodelist'] = val_array

			print "Salvando el show" + doc['show_id']

			c_tvshows.save(res['Show'])



print "Inicio del proceso de actualizacion"

response = urllib2.urlopen('http://services.tvrage.com/feeds/last_updates.php')

xml=response.read()

res = xmltodict.parse(xml)

c_last = db['last_updates']

print "Borrando la tabla de control"
c_last.remove()

print "Salvando la descarga"
c_last.save(res)

docs = res['updates']['show']

for doc in docs:
	print doc['id']
	#print "Aqui actualizamos todo"
	response = urllib2.urlopen('http://services.tvrage.com/feeds/full_show_info.php?sid=' + doc['id'])

	xml=response.read()

	res = xmltodict.parse(xml)

	try:
		val = res['Show']['Episodelist']['Season']
	except KeyError:
		val = []

	res['Show']['Episodelist'] = []

	if isinstance(val, (list, tuple)):
		val_array = val
	else:
		val_array = [val]

	for season in val_array:
		if isinstance(season['episode'], (list, tuple)):
			pass
		else:
			aux = [season['episode']]
			season['episode'] = aux

	res['Show']['Episodelist'] = val_array
	print "***********************************"
	#print res['Show'] 
	print "***********************************"
	
	print "Salvando el show" + doc['id']	

	c_show = c_tvshows.find_one({'showid': doc['id']})
	print "***********************************"
	#print c_show
	if 'users' in c_show:
		print c_show['users']
		res['Show']['users'] = c_show['users']
	else:
		users=[]
		res['Show']['users'] = users
	print "***********************************"
	print c_show['_id']
	res['Show']['_id'] =  c_show['_id']
	
	c_tvshows.save(res['Show'])
	#c_tvshows.save(res['Show'])

