fire off a get all command:
curl -H "Content-Type: application/json" -X POST -d '[{"subscription_id": "2","object": "tag","object_id": "bagremoved","changed_aspect": "media","time": 1297286541}, {"on_id": "2","object": "tag","object_id": "bagsintrees","changed_aspect": "media","time": 1297286541}]' http://www.bagsintrees.org/igrm/newbag

Kill zombie spids:
ps xf | grep node | grep -v "\_" | awk '{ print $1 }' | xargs kill