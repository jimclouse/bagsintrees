select 		* 
from 		bagsintrees.photos 
order by 	created desc
{{#limit}}
	limit {{limit}};
{{/limit}}