fire off a get all command:
curl -H "Content-Type: application/json" -X POST -d '[{"subscription_id": "2","object": "tag","object_id": "bagremoved","changed_aspect": "media","time": 1297286541}, {"subscription_id": "2","object": "tag","object_id": "bagsintrees","changed_aspect": "media","time": 1297286541}]' http://www.bagsintrees.org/igrm/newbag

local curl:
curl -H "Content-Type: application/json" -X POST -d '[{"subscription_id": "2","object": "tag","object_id": "bagsintrees","changed_aspect": "media","time": 1297286541}]' localhost:9001/igrm/newbag


Kill zombie spids:
ps xf | grep node | grep -v "\_" | awk '{ print $1 }' | xargs kill