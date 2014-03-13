from pymongo import *

print "Conectando al Servidor de Base de Datos Local..."
conexion = Connection() # Conexion local por defecto

#creando/obteniendo un objeto que referencie a la base de datos.
db = conexion['socialshows-dev'] #base de datos a usar

print "Establecida a la BBDD"

c_tvshows = db['tvshows']

c_update = c_tvshows.find()

i=0

for doc in c_update:
	
	try:
		val = doc['users']
	except KeyError:
		val = []

	if isinstance(val, (list, tuple)):
		val_array = val
	else:
		val_array = [val]	

	#print i 
	#print doc['showid']
	#print len(val)
	doc['followers'] = len(val)
	c_tvshows.save(doc)
	i = i+1
