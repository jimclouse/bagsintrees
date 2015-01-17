select 		c.comment
			,u.name
			,c.userId
from 		bagsintrees.comments c 
	join 		bagsintrees.users u 
		on 			c.userId = u.id
where 		c.photoId = '$id$';