select 	u.id, u.name, u.profilePicture, count(*) as tagCount 
from 	bagsintrees.users u
	join 	bagsintrees.photos  p
		on 		u.id = p.userId
group by u.id
order by count(*) desc, max(p.created) desc;