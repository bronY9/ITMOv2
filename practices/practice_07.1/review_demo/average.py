"""Учебный пример с намеренной ошибкой для проверки AI-ревью."""


def average(numbers: list[float]) -> float:
    """Вернуть среднее значение, а для пустого списка — 0."""
    return sum(numbers) / len(numbers)
