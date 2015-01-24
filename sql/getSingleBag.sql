select 	p.*
        ,u.profilePicture
from 		bagsintrees.photos p
  join      bagsintrees.user u
    on        p.userId = u.id
where 	p.id = '$id$';