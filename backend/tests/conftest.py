import os
import tempfile

import pytest

from app import create_app


class TestConfig:
    TESTING = True
    DATABASE_PATH = None


@pytest.fixture()
def app():
    handle, path = tempfile.mkstemp(suffix=".db")
    os.close(handle)

    TestConfig.DATABASE_PATH = path
    application = create_app(TestConfig)
    yield application

    try:
        os.remove(path)
    except OSError:
        pass


@pytest.fixture()
def client(app):
    return app.test_client()
