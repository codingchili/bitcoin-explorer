import base58
import hashlib
import ecdsa
import binascii


class Address:
    """
    Handles generation of bitcoin addresses in different formats; wif, compressed, uncompressed.
    """

    def __init__(self, uncompressed, compressed, private, public):
        self.compressed_hash = Address.__hash160(compressed)
        self.compressed = Address.to_address(self.compressed_hash)
        self.uncompressed_hash = Address.__hash160(uncompressed)
        self.uncompressed = Address.to_address(self.uncompressed_hash)
        self.public = public.hex()

        if private is not None:
            self.private = private.hex()
            self.wif = Address.to_wif(self.private)


    @staticmethod
    def to_address(hex_key, version="00"):
        return Address.__checksum_hash(hex_key, prefix=version).decode("utf-8")

    @staticmethod
    def to_wif(private_key, network="80", keytype="01"):
        return Address.__checksum_hash(private_key, prefix=network, postfix=keytype).decode("utf-8")

    @staticmethod
    def __double_sha256(value):
        return hashlib.sha256(hashlib.sha256(value).digest()).hexdigest()

    @staticmethod
    def __hash160(value):
        return hashlib.new("ripemd160", hashlib.sha256(value).digest()).hexdigest()

    @staticmethod
    def __checksum_hash(address, prefix="", postfix=""):
        checksum = Address.__double_sha256(binascii.unhexlify(prefix + address + postfix))[:8]  # first 4 bytes
        return base58.b58encode(binascii.unhexlify(prefix + address + postfix + checksum))

    @staticmethod
    def generate():
        generated = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
        private = generated.to_string()
        public = generated.get_verifying_key().to_string()
        return Address.create_from(public, private)

    @staticmethod
    def create_public(public):
        return Address.create_from(None, public)

    @staticmethod
    def create_from(private, public):
        x, y = public[:len(public) // 2], public[len(public) // 2:]
        # prefix uncompressed with x04
        uncompressed = b"\x04" + x + y
        # prefix compressed key with x02 for even y, x03 for odd y.
        compressed = (b"\x02" if y[-1] % 2 == 0 else b"\x03") + x
        return Address(uncompressed, compressed, private, public)
