all:
	docker compose up --build -d

re:
	docker compose down
	docker compose up --build -d

clean:
	docker compose down -v

fclean:
	docker compose down -v

.PHONY: all re clean fclean