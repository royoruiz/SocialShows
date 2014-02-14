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
response = urllib2.urlopen('http://services.tvrage.com/feeds/full_show_info.php?sid=663')

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

print json.dumps(val_array)

for season in val_array:
	if isinstance(season['episode'], (list, tuple)):
		pass
	else:
		aux = [season['episode']]
		season['episode'] = aux


res['Show']['Episodelist'] = val_array

print "********************************************************"


load_control = json.dumps(res['Show'])

print load_control

#c_tvshows = db['tvshows']

#c_tvshows.save(res['Show'])

#c_update = c_tvshows.find()

#for doc in c_update:
#	print 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
#	print doc
