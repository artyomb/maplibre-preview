# MapLibre Preview

Ruby gem для разработки инструментов MapLibre GL JS стилей с расширенной фильтрацией, визуализацией рельефа и мониторингом производительности. Предназначен для бесшовной интеграции в Sinatra приложения.

[![Ruby](https://img.shields.io/badge/ruby-2.7+-red.svg)](https://ruby-lang.org)
[![Sinatra](https://img.shields.io/badge/sinatra-web_framework-lightgrey.svg)](http://sinatrarb.com/)
[![MapLibre](https://img.shields.io/badge/maplibre-gl_js-blue.svg)](https://maplibre.org/)
[![English](https://img.shields.io/badge/english-documentation-green.svg)](../README.md)

## Ключевые возможности

- **Расширенная фильтрация слоев**: Фильтрация слоев на основе метаданных с поддержкой сложных выражений фильтров
- **Визуализация рельефа**: Полная поддержка рельефа с профилями высот и генерацией изолиний
- **Мониторинг производительности**: Мониторинг FPS, использования памяти и загрузки тайлов в реальном времени
- **Интерактивная отладка**: Режимы наведения и клика для инспекции объектов
- **Интеграция с Sinatra**: Бесшовная интеграция как расширение Sinatra с вспомогательными методами
- **Обслуживание статических ресурсов**: Встроенный middleware для обслуживания JavaScript модулей без конфликтов

## Обзор архитектуры

Gem состоит из нескольких интегрированных компонентов:

### Основные компоненты

- **[Основной модуль](../lib/maplibre-preview.rb)** - Основная функциональность gem включая расширение Sinatra, Rack middleware, вспомогательные методы и автономное приложение
- **[Slim шаблоны](../lib/maplibre-preview/views/)** - HTML шаблоны для интерфейса карты
- **[JavaScript модули](../lib/maplibre-preview/public/js/)** - Клиентская логика фильтрации и рельефа

### Поток данных

1. **Интеграция Sinatra** → Регистрация расширения → Настройка опций → Использование помощников
2. **Обслуживание ресурсов** → StaticMiddleware перехватывает запросы `/js/*` → Обслуживает из gem
3. **Рендеринг карты** → Вспомогательные методы рендерят Slim шаблоны → Включают внешние зависимости
4. **Клиентское взаимодействие** → JavaScript модули обрабатывают фильтрацию и функции рельефа

## Быстрый старт

### Установка

Добавьте в ваш Gemfile:

```ruby
gem 'maplibre-preview'
```

Затем выполните:

```bash
bundle install
```

### Базовая интеграция

```ruby
require 'maplibre-preview'

class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Передача URL стиля

Есть несколько способов передать URL стиля карте:

**1. Через параметр URL:**
```
http://localhost:9292/map?style_url=https://example.com/style.json
```

**2. Через параметр маршрута:**
```ruby
get '/map' do
  params[:style_url] = 'https://example.com/style.json'
  slim :maplibre_map, layout: :maplibre_layout
end
```

**3. Через параметр source:**
```
http://localhost:9292/map?source=Example_Style
```

### Автономный сервер разработки

Gem включает полное Sinatra приложение для тестирования и разработки:

```ruby
require 'maplibre-preview'

# Запуск автономного сервера разработки
MapLibrePreview::App.run!
```

Это запускает полноценный веб-сервер с:
- Интерфейсом карты по адресу `http://localhost:4567/map`
- Обслуживанием JavaScript ресурсов из `/js/*`
- Всей функциональностью gem из коробки

**Как использовать со стилем:**
- Передать URL стиля как параметр: `http://localhost:4567/map?style_url=https://example.com/style.json`

**Без стиля:**
- Показывает только базовые тайлы (OpenStreetMap)
- Полезно для тестирования базовой функциональности
- Без пользовательских слоев и стилизации

**Случаи использования:**
- Быстрое тестирование функциональности gem
- Разработка и отладка
- Демонстрация возможностей

## Конфигурация

Gem использует фиксированные настройки:

- **Центр карты**: `[35.15, 47.41]`
- **Начальный зум**: `2`
- **Базовая карта**: Тайлы OpenStreetMap с прозрачностью 0.8
- **Версии библиотек**: MapLibre GL JS 5.7.3, MapLibre Contour 0.1.0, D3.js 7

**URL стиля**: Передается через параметр URL `?style_url=https://example.com/style.json`

## Справочник API

### Расширение Sinatra

```ruby
# Регистрация расширения
register MapLibrePreview::Extension
```

### Интеграция шаблонов

Gem предоставляет Slim шаблоны, которые можно использовать напрямую в маршрутах:

| Шаблон | Описание | Использование |
|--------|----------|---------------|
| `maplibre_map` | Основной шаблон интерфейса карты | `slim :maplibre_map, layout: :maplibre_layout` |
| `maplibre_layout` | HTML макет с внешними зависимостями | Используется как макет для шаблона карты |

### Автономное приложение

```ruby
# Доступные маршруты
GET /map          # Основной интерфейс разработки карт
GET /js/:file     # Обслуживание JavaScript ресурсов
```

## Поддержка метаданных стилей

Gem поддерживает расширенную фильтрацию через метаданные стилей:

```json
{
  "metadata": {
    "filters": {
      "buildings": [
        {
          "id": "residential",
          "filter": ["==", ["get", "type"], "residential"]
        },
        {
          "id": "commercial", 
          "filter": ["==", ["get", "type"], "commercial"]
        }
      ]
    },
    "locale": {
      "en": {
        "buildings": "Buildings",
        "residential": "Residential",
        "commercial": "Commercial"
      }
    }
  }
}
```

## Поддержка рельефа

Для визуализации рельефа добавьте конфигурацию рельефа в ваш стиль:

```json
{
  "terrain": {
    "source": "terrain-source"
  },
  "sources": {
    "terrain-source": {
      "type": "raster-dem",
      "tiles": ["https://your-terrain-tiles/{z}/{x}/{y}.png"],
      "encoding": "terrarium"
    }
  }
}
```

## Мониторинг производительности

Gem включает мониторинг производительности в реальном времени:

- **FPS и время кадра**: Производительность рендеринга в реальном времени
- **Использование памяти**: Мониторинг памяти кучи JavaScript
- **Загрузка тайлов**: Количество активных тайлов и статус загрузки
- **Управление слоями**: Количество активных слоев и видимость
- **Уровень масштабирования**: Текущий уровень масштабирования карты
- **Статус рельефа**: Доступность данных рельефа

## Структура файлов

```
lib/
├── maplibre-preview.rb          # Основной модуль gem и интеграция Sinatra
└── maplibre-preview/
    ├── version.rb                # Версия gem
    ├── views/                    # Slim шаблоны
    │   ├── map.slim             # Основной интерфейс карты
    │   └── map_layout.slim      # HTML макет
    └── public/js/               # JavaScript модули
        ├── filters.js           # Логика фильтрации слоев
        └── contour.js           # Функции рельефа и изолиний
```

## Разработка

### Предварительные требования

- Ruby 2.7+
- Sinatra 2.1+
- Slim 4.1+
- Rack 2.0+

### Настройка

```bash
# Установка зависимостей
bundle install

# Запуск тестов
bundle exec rspec

# Запуск RuboCop
bundle exec rubocop

# Сборка gem
gem build maplibre-preview.gemspec
```

### Тестирование

```bash
# Запуск всех тестов
bundle exec rspec

# Запуск конкретного файла тестов
bundle exec rspec spec/maplibre_preview_spec.rb
```

## Примеры интеграции

### Базовая интеграция карты

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Интеграция URL стиля

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    # URL стиля передается через params[:style_url]
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Множественные маршруты карт

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    # Использует params[:style_url] если предоставлен
    slim :maplibre_map, layout: :maplibre_layout
  end
  
  get '/terrain' do
    # Устанавливаем URL стиля через params
    params[:style_url] = 'https://example.com/terrain-style.json'
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

## Лицензия

Этот проект лицензирован под лицензией MIT - см. файл [LICENSE](../LICENSE) для деталей.
