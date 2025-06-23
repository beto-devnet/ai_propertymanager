$version = 'v0.2.0'
$environment = 'staging'
$tag = ''

if ($environment -eq 'staging') {
    $tag = $environment + "-" + $version
} else {
    $tag = $version
}

if (docker image ls -q --filter "reference=ai_propertymanager_ui:"+$tag ) {
    docker rmi ai_propertymanager_ui:$tag
}
if (docker image ls -q --filter "reference=ai_propertymanager_api:"+$tag ) {
    docker rmi ai_propertymanager_api:$tag
}

docker build -t ai_propertymanager_ui:$tag --build-arg ENVIRONMENT=production -f .\admin\Dockerfile .\admin
docker build -t ai_propertymanager_api:$tag -f .\ticketApi\ticketApi\Dockerfile .\ticketApi\ticketApi

docker image tag ai_propertymanager_ui:$tag betoramiz/ai_propertymanager_ui:$tag
docker push betoramiz/ai_propertymanager_ui:$tag

docker image tag ai_propertymanager_api:$tag betoramiz/ai_propertymanager_api:$tag
docker push betoramiz/ai_propertymanager_api:$tag