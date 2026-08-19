
update public.fb_post_pool p set content = regexp_replace(p.content, '\[\s*[Ii]mage:[^\]]*\]', '[Image: ' || v.b || ']')
from (values
 ('a9ebab5a-6fc6-492c-9d3c-c9dc496dfc63'::uuid,'Browse hundreds of ready-to-use AI prompts by category'),
 ('88d73778-cf7d-47d7-a8d2-54724117fce1'::uuid,'The Paste Prompts marketplace, open on any device'),
 ('0bd3bb33-2ee4-49ae-b1ee-0eaab794ea42'::uuid,'One-click copy button on every prompt page'),
 ('ebc23c80-6d9f-4d0a-ad95-94f79280cf11'::uuid,'5-star rated prompts, tested before they go live'),
 ('67e6999c-6bbb-48ec-9830-3cac1e3b165b'::uuid,'Creator leaderboard: top earning prompt sellers')
) as v(id,b)
where p.id = v.id;
update public.fb_post_pool set image_url = null where id in (
 'a9ebab5a-6fc6-492c-9d3c-c9dc496dfc63','88d73778-cf7d-47d7-a8d2-54724117fce1',
 '0bd3bb33-2ee4-49ae-b1ee-0eaab794ea42','ebc23c80-6d9f-4d0a-ad95-94f79280cf11',
 '67e6999c-6bbb-48ec-9830-3cac1e3b165b');
