# FROM node:alpine AS build
# WORKDIR /app
# COPY ./ .
# RUN npm install
# RUN npm run build -- --configuration development

# FROM nginx:alpine
# WORKDIR /app
# EXPOSE 4200
# COPY ./admin/nginx.conf /etc/nginx/nginx.conf
# COPY --from=build /app/dist/admin/browser /usr/share/nginx/html

# FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# WORKDIR /server
# EXPOSE 8080
# EXPOSE 8081

# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS netbuild
# WORKDIR /src
# COPY ["./ticketApi/ticketApi/ticketApi.csproj", "ticketApi/"]
# RUN dotnet restore "ticketApi/ticketApi.csproj"

# WORKDIR "/src/ticketApi"
# COPY ./ticketApi/ticketApi .
# RUN dotnet build "ticketApi.csproj" -c Release -o /server/build

# FROM netbuild AS publish
# ARG BUILD_CONFIGURATION=Release
# RUN dotnet publish "ticketApi.csproj" -c Release -o /server/publish /p:UseAppHost=false

# FROM base AS final
# WORKDIR /server
# COPY --from=publish /server/publish .
# ENTRYPOINT ["dotnet", "ticketApi.dll"]
