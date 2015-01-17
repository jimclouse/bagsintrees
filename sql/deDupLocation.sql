update  bagsintrees.photos pho
    join (  select  p.id
                    ,p.longitude
                    ,p.latitude
                    ,@curRow := if(@latitude = p.latitude and  @longitude = p.longitude, @curRow + 1, 1)  AS row_number
                    ,@latitude := p.latitude
                    ,@longitude := p.longitude
            from    bagsintrees.photos p
                join (  select latitude, longitude , count(*) from photos group by latitude, longitude having count(*) > 1) as T
                    on      p.latitude = T.latitude
                        and     p.longitude = p.longitude
                join    (select @curRow := 0) r
        ) Dups
        on  pho.id = Dups.id
set     pho.longitude = pho.longitude+0.00001
        ,pho.latitude = pho.latitude +0.00001
where   Dups.row_number = 2;