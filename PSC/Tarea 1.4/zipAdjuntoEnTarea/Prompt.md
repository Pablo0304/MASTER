# Three Tier App Hello World 

## Bussines Logic Definition

```
	
	#
	#
	inc: N
	->
	add() ->

	#
	get_value() <-
	N <- 

```

## Tasks

### 1. REST endpoint + Bussines Logic

#### Bussines Logic Implementation
	+ Programming Languague: Python
	+ File Name: logic.py
	+ Implement the Bussines Logic in a class.
	+ The value will be a record (k-v pair) on a Redis database:
	  	  key: 'the_value', value: unsigned_int 
	+ Requirements:
	  - thread-safe

#### REST endpoint for the Bussines Logic
	+ Programming Languague: Python
	+ File Name: main_endpoint.py
	+ POST /add/<inc> will call add()
	+ GET /value/> will call get_counter()

#### Docker
	 + Write a Dockerfile to create a docker container
	 where the endpoint and the logic must be installed

### 2. Front End

#### Bussines Logic Proxy
	 + Programming Language: JavaScript
	 + Write a class with methods of the bussines logic.
	 + Class name: Bussines_Logic_Proxy
	 + Each method will send a REST request to the corresponding bussines method.

#### User Interface (UI)
	 + Write a nice html page that allows the user call the bussines logic mehtods.
	 + Programming language: HTML, CSS, Javascript
	 + File Name: user_interface.html
	 + The UI must call the apropriate method in the Bussiness Logic Proxy

#### HTML server
	+ Programming Languague: Python
	+ File Name: main_server.py
	+ Write a html server from which the UI can be downloaded
	+ Port Number: 9999

#### Docker
	 + Write a Dockerfile to create a docker container
	 from where the UI can be downloaded through main_server.py

### 3. Database Container
	+ The database used by the Bussines Logic will be Redis
	+ If necessary, create a DockerFile to configure a docker container


### 4. Orchestration
	+ Write a docker-compose.yml to launch the three containers:
	  - bussines logic endpoint
	  - user interface
	  - database


