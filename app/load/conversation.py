from pymongo import *

print "Conectando al Servidor de Base de Datos Local..."
conexion = Connection() # Conexion local por defecto

#creando/obteniendo un objeto que referencie a la base de datos.
db = conexion['socialshows-dev'] #base de datos a usar

print "Establecida a la BBDD"

c_articles = db['articles']

c_update = c_articles.find()

i=0

for doc in c_update:
	doc['conversation'] = doc['_id']
	#print(doc)
	c_articles.save(doc)

