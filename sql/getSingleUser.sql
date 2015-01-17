select 		name
			,profilePicture
			,count(*) as tagCount
from 		bagsintrees.users u 
	join 		bagsintrees.photos p
		on 			u.id = p.userId
where 		u.id = '$id$' 
group by 	u.name, u.profilePicture;